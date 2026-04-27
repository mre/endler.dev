+++
title="What Rust Doesn't Prevent You From"
date=2026-04-27
draft=false
[taxonomies]
tags=["rust", "dev", "security"]
[extra]
subtitle="Lessons from the rust-coreutils Audit"
+++

In April 2026, Canonical [disclosed 44 CVEs](https://discourse.ubuntu.com/t/an-update-on-rust-coreutils/80773)
found in `uutils/coreutils` (the Rust reimplementation of GNU coreutils that ships
by default in recent Ubuntu releases). Most of them came out of an audit, commissioned ahead of the 26.04 LTS.

I believe this list is a great learning opportunity for anyone writing systems code, Rust or otherwise. That's because these are real bugs that made it into production. The code had been reviewed by multiple people, passed the existing test suite, and was running on real systems for months before they were found. That's an indicator that these are not "obvious" mistakes, but problems that could happen even to experienced Rust developers.

Now, I'm not posting this to criticize the uutils team. GNU coreutils has a long history of CVEs of its own, and the team behind uutils is truly pushing to make foundational software better. We had Jon Seager, VP Engineering for Ubuntu, in our podcast recently, and a lot of listeners applauded his honesty about the state of Rust at Canonical and the headwinds they faced. You can listen to it [here](https://corrode.dev/podcast/s05e05-canonical/). 

Mind you, none of the bugs are memory-safety isuees and none of them are the kind of thing
the borrow checker, `unsafe` lints, or `cargo audit` would catch.

I want to walk through the bugs grouped by root cause, with concrete (and sometimes
a little simplified) before/after code, so you can recognize each pattern in your own
work.

All CVEs are referenced in the official Discourse post [here](https://discourse.ubuntu.com/t/an-update-on-rust-coreutils/80773).

## Don't Trust a Path Across Two Syscalls

This is the largest cluster, and it's the reason `cp`, `mv`, and `rm` are
**still GNU** in Ubuntu 26.04 LTS.

The problem arises if you do one syscall to *check* something about a
path, then another syscall to *act* on the same path. Between those two calls,
an attacker with write access to a parent directory can swap the path component
for a symbolic link pointing somewhere else. The kernel re-resolves the path
from scratch on the second call, and your privileged action lands on the
attacker's chosen target.

Rust's standard library makes this very easy to get wrong because the ergonomic
APIs ([`fs::metadata`](https://doc.rust-lang.org/std/fs/fn.metadata.html),
[`File::create`](https://doc.rust-lang.org/std/fs/struct.File.html#method.create),
[`fs::remove_file`](https://doc.rust-lang.org/std/fs/fn.remove_file.html),
[`fs::set_permissions`](https://doc.rust-lang.org/std/fs/fn.set_permissions.html))
all take a `&Path` and re-resolve it every time.

### Example: `install` (CVE-2026-35355)

Here's the bug, simplified from
<a href="https://github.com/uutils/coreutils/pull/10067/files" target="_blank" rel="noopener noreferrer"><code>src/uu/install/src/install.rs</code></a>.

```rust
// 1. Clear the destination
fs::remove_file(to)?;

// 2. ... some work in between ...

// 3. Create the destination. The path is re-resolved here!
let mut dest = File::create(to)?; // follows symlinks, truncates
copy(from, &mut dest)?;
```

Between step 1 and step 3, an unprivileged attacker who has write access to the
parent directory can plant `to` as a symlink to, say, `/etc/shadow`. The
`File::create` call follows the symlink and the privileged process happily
overwrites `/etc/shadow` with the source file's contents.

The fix uses [`create_new(true)`](https://doc.rust-lang.org/std/fs/struct.OpenOptions.html#method.create_new).
If something appears at this path between the remove and the create, it will fail safely.

```rust
fs::remove_file(to)?;

// create_new() => O_EXCL: fail if anything (e.g. a planted symlink)
// has appeared at `to` since we removed it.
let mut dest = OpenOptions::new()
    .write(true)
    .create_new(true)
    .open(to)?;
copy(from, &mut dest)?;
```

### Anchor on a File Descriptor Instead

`create_new()` only helps when you're creating a new file. For everything else, open the parent directory once and work relative to that handle. The kernel can't be tricked into resolving the path somewhere else if it never re-resolves it.

A `&Path` in Rust looks like a value, but to the kernel it's just a name that can point to different things from one syscall to the next. If you act on the same path twice, assume it's a TOCTOU bug until you've proven otherwise.

## Set Permissions at Creation Time, Not After

A close relative of TOCTOU. You want a file or directory with restrictive
permissions, so you write:

```rust
fs::create_dir(&path)?;                  // created with default perms first
fs::set_permissions(&path, Permissions::from_mode(0o700))?;  // tightened after
```

For a brief moment, `path` exists with the default permissions (usually `0755`) before the second call tightens them. Any other user on the system can `open()` it during that window, and once they have a file descriptor, the later `chmod` doesn't take it away from them.



### Example: `mkdir -m 0700` (CVE-2026-35353)

The fix from <a href="https://github.com/uutils/coreutils/pull/10036/files" target="_blank" rel="noopener noreferrer">PR #10036</a> is old-school. It temporarily sets `umask(0)` so the kernel creates the directory with exactly the requested mode, in one syscall.

```rust
fn create_dir_with_mode(path: &Path, mode: u32) -> io::Result<()> {
    // Drop umask to 0 so the kernel honors `mode` exactly.
    // The RAII guard restores the previous umask on drop, even on panic.
    let _guard = UmaskGuard::set(0);
    DirBuilder::new().mode(mode).create(path)
}
```

Two things worth highlighting:

- `umask` is per-process, not per-thread. In a multi-threaded program, other threads briefly see `umask = 0` too. That's fine for a CLI like `mkdir`, but in a server you'd want [`OpenOptions::mode()`](https://doc.rust-lang.org/std/os/unix/fs/trait.OpenOptionsExt.html#tymethod.mode) with `create_new()`, or `mkdirat`, instead.
- The bug is C-shaped, but the defense, an RAII guard that restores the umask on drop, is idiomatic Rust.

The rule is to set permissions at the moment of creation, never afterwards.


## Compare Path Identity, Not Spelling

String equality on paths is not the same as filesystem identity.

The `chmod` bug is the cleanest example. The original check was literally this.

```rust
if recursive && preserve_root && file == Path::new("/") {
    return Err(PreserveRoot);
}
```

That string comparison is bypassed by anything that *resolves* to `/` but
isn't spelled `/`: `/../`, `/./`, `/usr/..`, or a symlink that points to `/`.
Run `chmod -R 000 /../` and it sails right past the safety check.

Here's the fix from <a href="https://github.com/uutils/coreutils/pull/10033/files" target="_blank" rel="noopener noreferrer">PR #10033</a>.

```rust
fn is_root(file: &Path) -> bool {
    // canonicalize() resolves `..`, `.`, and symlinks
    matches!(fs::canonicalize(file), Ok(p) if p == Path::new("/"))
}

if recursive && preserve_root && is_root(file) {
    return Err(PreserveRoot);
}
```

[`canonicalize`](https://doc.rust-lang.org/std/fs/fn.canonicalize.html) resolves `..`, `.`, and symlinks into a real absolute path. That's better than string comparison, but it's still a TOCTOU read. For real protection, GNU coreutils compares the `(dev, inode)` pair against `/`, which is what [CVE-2026-35349](https://ubuntu.com/security/CVE-2026-35349) recommends for `rm`. The principle is identity, not spelling.

`rm ./` (CVE-2026-35363) is a particularly cruel variant: the code refused `.` and `..`, but accepted `./` and `.///`, then deleted the current directory while printing `Invalid input`, making users think nothing happened.

## Stay in Bytes at Unix Boundaries

Rust's [`String`](https://doc.rust-lang.org/std/string/struct.String.html) and [`&str`](https://doc.rust-lang.org/std/primitive.str.html) are always UTF-8. Unix paths, environment variables, arguments, and the bytes flowing through tools like `cut`, `comm`, and `tr` are not. They're arbitrary bytes. Every time a Rust program bridges that gap, it has three options.

1. **Lossy conversion** with [`from_utf8_lossy`](https://doc.rust-lang.org/std/string/struct.String.html#method.from_utf8_lossy) or [`to_string_lossy`](https://doc.rust-lang.org/std/ffi/struct.OsStr.html#method.to_string_lossy) silently rewrites invalid bytes to U+FFFD. That's data corruption.
2. **Strict conversion** with [`unwrap`](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap) or `?` crashes or refuses to operate.
3. **Staying in bytes** with [`OsStr`](https://doc.rust-lang.org/std/ffi/struct.OsStr.html) or `&[u8]` is what you should usually do for filesystem and stream data.

The audit caught both lossy and strict bugs across `comm`, `printenv`, `split`, `ln`, and `sort --files0-from`.

### Example: `comm` (CVE-2026-35346)

Here's the original code, <a href="https://github.com/uutils/coreutils/pull/10206/files" target="_blank" rel="noopener noreferrer">from <code>src/uu/comm/src/comm.rs</code></a>.

```rust
// ra, rb: &[u8], raw bytes from the input files.
// from_utf8_lossy replaces invalid bytes with U+FFFD => silent corruption.
print!("{}", String::from_utf8_lossy(ra));
print!("{delim}{}", String::from_utf8_lossy(rb));
```

GNU `comm` works on binary files because it just shuffles bytes around. The uutils version replaced anything that wasn't valid UTF-8 with `U+FFFD`, silently corrupting the output.

Here's the fix.

```rust
// Stay in bytes. No UTF-8 round-trip, no corruption.
let mut out = BufWriter::new(io::stdout().lock());
out.write_all(ra)?;
out.write_all(delim)?;
out.write_all(rb)?;
```

The fix is to stay in bytes. [`print!`](https://doc.rust-lang.org/std/macro.print.html) forces a UTF-8 round-trip through [`Display`](https://doc.rust-lang.org/std/fmt/trait.Display.html). [`Write::write_all`](https://doc.rust-lang.org/std/io/trait.Write.html#method.write_all) doesn't.

### Pick the Right Type for the Job

For Unix-flavored systems code, use [`Path`](https://doc.rust-lang.org/std/path/struct.Path.html) and [`PathBuf`](https://doc.rust-lang.org/std/path/struct.PathBuf.html) for filesystem paths, [`OsString`](https://doc.rust-lang.org/std/ffi/struct.OsString.html) for environment variables, and `Vec<u8>` or `&[u8]` for stream contents. Never round-trip them through `String` just to log them.

UTF-8 is a great default for application strings. It's the wrong default for the raw stuff Unix tools work with.


## Treat `panic!` as a Denial of Service

In a CLI, every `unwrap`, `expect`, slice index, unchecked arithmetic, and [`from_utf8`](https://doc.rust-lang.org/std/str/fn.from_utf8.html) is a potential denial of service if an attacker can shape the input.

`sort --files0-from` (CVE-2026-35348) is the canonical case. Feed it a non-UTF-8 path and the whole pipeline aborts on a panic.

There's no "before" code worth quoting. The fix is the rule itself.

> In code that processes untrusted input, treat every `unwrap`/`expect`/
> indexing/`as` cast as a CVE waiting to be filed. Use `?`, `get`,
> `checked_*`, `try_from`, and surface a real error.

A good lint baseline to catch this in CI:

```toml
# Cargo.toml, [lints.clippy]
unwrap_used      = "warn"
expect_used      = "warn"
panic            = "warn"
indexing_slicing = "warn"
arithmetic_side_effects = "warn"
```

Turn them off in tests, but in `src/` they catch exactly this class of bug.

## Propagate Every Error

Three CVEs come from ignoring or losing error information.

`chmod -R` and `chown -R` returned the exit code of the *last* file processed instead of the worst one, so `chmod -R 600 /etc/secrets/*` could fail on half the files and still exit `0`. `dd` called [`Result::ok()`](https://doc.rust-lang.org/std/result/enum.Result.html#method.ok) on its [`set_len()`](https://doc.rust-lang.org/std/fs/struct.File.html#method.set_len) call to mimic GNU's behavior on `/dev/null`, but that same code ran for regular files too, so a full disk silently produced a half-written destination.

The shape is always the same. Someone wanted to throw away a [`Result`](https://doc.rust-lang.org/std/result/enum.Result.html) and reached for `.ok()`, [`.unwrap_or_default()`](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or_default), or `let _ =`. Here's the pattern to use instead.

```rust
// Don't bail on the first error, but remember the worst one.
let mut worst = 0;
for file in files {
    if let Err(e) = chmod_one(file) {
        worst = worst.max(e.exit_code());
    }
}
process::exit(worst);
```

If you write `.ok()` to discard a `Result`, leave a comment explaining *why* this specific failure is safe to ignore. If you can't write that comment, it isn't.


## Match the Original Tool's Behavior Exactly

A surprising number of these CVEs aren't "the code does something unsafe." They're "the code does something *different* from GNU, and a shell script somewhere relied on the GNU behavior."

The clearest example is `kill -1` (CVE-2026-35369). GNU reads `-1` as "signal 1" and asks for a PID. uutils read it as "send the default signal to PID -1", which on Linux means *every process you can see*. A typo becomes a system-wide kill switch.

There's no "before/after" code to show here. The lesson is meta.

> If you reimplement a battle-tested tool, *bug-for-bug* compatibility on
> exit codes, error messages, edge cases, and option semantics is a
> security feature, not a stylistic choice. Anywhere your behavior diverges
> from the original, somebody's shell script is making a wrong decision.

uutils now runs the upstream GNU coreutils test suite against itself in CI. That's the right scale of defense for this class of bug.

## Resolve Inputs Before Crossing a Trust Boundary

[CVE-2026-35368](https://ubuntu.com/security/CVE-2026-35368) is the worst single bug in the audit. It's local root code execution, and you can't see it just by reading the code.

Here's the pattern.

```rust
chroot(new_root)?;
// Still uid 0, but now inside the attacker-controlled filesystem.
let user = get_user_by_name(name)?;
setgid(user.gid())?;
setuid(user.uid())?;
exec(cmd)?;
```

The trap is that `get_user_by_name` ends up loading shared libraries from the *new* root filesystem to resolve the username. An attacker who can plant a file in the chroot gets to run code as uid 0.

GNU `chroot` resolves the user *before* calling `chroot`. Same fix here.

```rust
// Resolve the user against the OUTER NSS database first.
let user = get_user_by_name(name)?;

chroot(new_root)?;
setgid(user.gid())?;
setuid(user.uid())?;
exec(cmd)?;
```

There's a general principle here that Rust can't help you with. Resolve everything you need *before* crossing into a less-trusted environment. Once you're across, every library call might run the attacker's code.

## What Rust *Did* Prevent

It's worth ending here. Look at the CVE list and notice what's *not* there:

- No buffer overflows.
- No use-after-free.
- No double-free.
- No data races on shared mutable state.
- No format-string bugs.
- No null-pointer dereferences.
- No uninitialized memory reads.

GNU coreutils has shipped CVEs in every one of those categories. The Rust rewrite has shipped zero. That's most of what historically goes wrong in a C codebase.

What's left is a more interesting class of bug. It lives at the boundary between your tidy Rust types and the messy world of paths, bytes, and syscalls. The compiler draws that boundary at `unsafe`, but the security boundary is somewhere else.

If you write systems code in Rust, treat this CVE list as a checklist. Grep your own codebase for `from_utf8_lossy`, stray `unwrap()` calls, discarded `Result`s, `File::create`, and string comparisons against `"/"`. Each hit is a place to ask what happens when an attacker controls the input. That's what the auditors were paid to find. You can find it for free.