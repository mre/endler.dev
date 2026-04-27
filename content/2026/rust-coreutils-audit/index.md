+++
title="What Rust Doesn't Protect You From"
date=2026-04-28
draft=false
[taxonomies]
tags=["rust", "dev", "security"]
[extra]
subtitle="Lessons from the rust-coreutils Audit"
+++

In April 2026, Canonical [disclosed 44 CVEs](https://discourse.ubuntu.com/t/an-update-on-rust-coreutils/80773) in `uutils/coreutils`, the Rust reimplementation of GNU coreutils that ships by default since 25.10. Most of them came out of an external audit commissioned ahead of the 26.04 LTS.

I read through the list and thought: what a great learning opportunity!

All 44 bugs landed in a production Rust codebase, written by people who knew what they were doing. None of them were caught by the borrow checker, [clippy lints](https://doc.rust-lang.org/stable/clippy/lints.html), or [cargo audit](https://rustsec.org/). None of them are memory-safety bugs.

I'm not writing this to criticize the uutils team. I actually want to thank them for sharing the audit results in such detail so that we can all learn from them. That takes a lot of courage.

We also had [Jon Seager, VP Engineering for Ubuntu, on our 'Rust in Production' podcast recently](https://corrode.dev/podcast/s05e05-canonical/) and a lot of listeners appreciated his honesty about the state of Rust at Canonical.

If you write systems code in Rust, this is the most concentrated set of "things the compiler won't save you from" you'll likely find anywhere right now.

## Don't Trust a Path Across Two Syscalls

This is the largest cluster of bugs in the audit. It's also the reason `cp`, `mv`, and `rm` are *still* GNU in Ubuntu 26.04 LTS. :(

The pattern is always the same. You do one syscall to *check* something about a path, then another syscall to *act* on the same path. Between those two calls, an attacker with write access to a parent directory can swap the path component for a symbolic link. The kernel re-resolves the path from scratch on the second call, and your privileged action lands on the attacker's chosen target.

Rust's standard library makes this easy to get wrong. The ergonomic APIs you reach for first ([`fs::metadata`](https://doc.rust-lang.org/std/fs/fn.metadata.html), [`File::create`](https://doc.rust-lang.org/std/fs/struct.File.html#method.create), [`fs::remove_file`](https://doc.rust-lang.org/std/fs/fn.remove_file.html), [`fs::set_permissions`](https://doc.rust-lang.org/std/fs/fn.set_permissions.html)) all take a `&Path` and re-resolve it every time.
That's fine for a normal program, but if you're writing a privileged tool that needs to be secure against local attackers, you have to be careful.

### Case Study: CVE-2026-35355

Here's the bug, simplified from <a href="https://github.com/uutils/coreutils/pull/10067/files" target="_blank" rel="noopener noreferrer"><code>src/uu/install/src/install.rs</code></a>.

```rust
// 1. Clear the destination
fs::remove_file(to)?;

// ...

// 2. Create the destination. The path is re-resolved here!
let mut dest = File::create(to)?; // follows symlinks, truncates
copy(from, &mut dest)?;
```

Between step 1 and step 2, anyone with write access to the parent directory can plant `to` as a symlink to, say, `/etc/shadow`. Then `File::create` follows the symlink and the privileged process happily overwrites `/etc/shadow` with whatever `from` happened to contain.

The fix uses [`OpenOptions::create_new(true)`](https://doc.rust-lang.org/std/fs/struct.OpenOptions.html#method.create_new):

> No file is allowed to exist at the target location, **also no (dangling) symlink**. In this way, if the call succeeds, the file returned is guaranteed to be new.

```rust
fs::remove_file(to)?;

let mut dest = OpenOptions::new()
    .write(true)
    .create_new(true)
    .open(to)?;
copy(from, &mut dest)?;
```


### Anchor on a File Descriptor Instead

A `&Path` in Rust *looks* like a value, but remember that to the kernel it's just a name. That name can point to different things from one syscall to the next.
Anchor your operations on a file descriptor instead.

`create_new()` only helps with that when you're creating a new file. For everything else, open the parent directory once and work **relative to that handle**.

If you act on the same path twice, assume it's a TOCTOU (Time Of Check To Time Of Use) bug until you've proven otherwise.

## Set Permissions at Creation Time, Not After

This is a close relative of TOCTOU. You want a directory with restrictive permissions, so you write something like this.

```rust
// Create with default permissions
fs::create_dir(&path)?;
// Fix up permissions
fs::set_permissions(&path, Permissions::from_mode(0o700))?;
```

The lights are on but it’s burglars!

For a brief moment, `path` exists with the default permissions. Any other user on the system can `open()` it during that window. Once they have a file descriptor, the later `chmod` doesn't take it away from them.

The rule is to set permissions at the moment of creation. Never afterwards.

### Case Study: `mkdir -m 0700` (CVE-2026-35353)

The fix from <a href="https://github.com/uutils/coreutils/pull/10036/files" target="_blank" rel="noopener noreferrer">PR #10036</a> is admittedly pretty old-school. It temporarily sets `umask(0)` so the kernel creates the directory with exactly the requested mode, in one syscall.

```rust
fn create_dir_with_mode(path: &Path, mode: u32) -> io::Result<()> {
    // Drop umask to 0 so the kernel honors `mode` exactly.
    // The RAII guard restores the previous umask on drop, even on panic.
    let _guard = UmaskGuard::set(0);
    DirBuilder::new().mode(mode).create(path)
}
```

I love that the bug is C-shaped but the defense (an RAII guard that restores the umask on drop) is idiomatic Rust.


## String Equality on Paths Is Not the Same as Filesystem Identity

The original `--preserve-root` check in `chmod` was literally this:

```rust
if recursive && preserve_root && file == Path::new("/") {
    return Err(PreserveRoot);
}
```

That comparison is bypassed by anything that *resolves* to `/` but isn't spelled `/`. So `/../`, `/./`, `/usr/..`, or a symlink that points to `/`. Run `chmod -R 000 /../` and see it fly right past your check and lock down the whole system.

Here's the fix from <a href="https://github.com/uutils/coreutils/pull/10033/files" target="_blank" rel="noopener noreferrer">PR #10033</a>.

```rust
fn is_root(file: &Path) -> bool {
    matches!(fs::canonicalize(file), Ok(p) if p == Path::new("/"))
}

if recursive && preserve_root && is_root(file) {
    return Err(PreserveRoot);
}
```

[`canonicalize`](https://doc.rust-lang.org/std/fs/fn.canonicalize.html) resolves `..`, `.`, and symlinks into a real absolute path. That's a lot better than string comparison.

Oh and if you were wondering about this line:

```rust
matches!(fs::canonicalize(file), Ok(p) if p == Path::new("/"))
```

I think that's just a fancy way of saying

```rust
// First, resolve the path to its canonical form
if let Ok(p) = fs::canonicalize(file) {
    // If that succeeded, check if the canonical path is "/"
    p == Path::new("/")
} else {
    false
}
```

That said, this still isn't bulletproof I think...? 🤔 There's a gap between the `canonicalize` call and the recursive `chmod` that follows. An attacker who controls a parent directory can swap things around in that window. For real protection, GNU coreutils opens the target and compares its `(dev, inode)` pair against `/`.
Think identity, not string equality.

By the way, my favorite bug in this group is `rm ./` (CVE-2026-35363). The code refused `.` and `..`, but happily accepted `./` and `.///`, then deleted the current directory while printing `Invalid input`. 😅

## Stay in Bytes at Unix Boundaries

Rust's [`String`](https://doc.rust-lang.org/std/string/struct.String.html) and [`&str`](https://doc.rust-lang.org/std/primitive.str.html) are always UTF-8.
That's a great choice in 99% of all cases, but Unix paths, environment variables, arguments, and the inputs flowing through tools like `cut`, `comm`, and `tr` live in the messy world of bytes.

Every time a Rust program bridges that gap, it has three options.

1. 🫩 **Lossy conversion** with [`from_utf8_lossy`](https://doc.rust-lang.org/std/string/struct.String.html#method.from_utf8_lossy) silently rewrites invalid bytes to U+FFFD. That's just fancy data corruption.
2. 🫤 **Strict conversion** with [`unwrap`](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap) or `?` crashes or refuses to operate.
3. 😚 **Staying in bytes** with [`OsStr`](https://doc.rust-lang.org/std/ffi/struct.OsStr.html) or `&[u8]` is what you should usually do.

The audit found bugs in both of the first two categories. Here's an example.

### Case Study: `comm` (CVE-2026-35346)

This is the original code, <a href="https://github.com/uutils/coreutils/pull/10206/files" target="_blank" rel="noopener noreferrer">from <code>src/uu/comm/src/comm.rs</code></a>.

```rust
// ra, rb are &[u8], raw bytes from the input files.
print!("{}", String::from_utf8_lossy(ra));
print!("{delim}{}", String::from_utf8_lossy(rb));
```

GNU `comm` works on binary files because it just shuffles bytes around. The uutils version replaced anything that wasn't valid UTF-8 with `U+FFFD`, which silently corrupted the output.

Here's the fix: stay in bytes.

```rust
let mut out = BufWriter::new(io::stdout().lock());
out.write_all(ra)?;
out.write_all(delim)?;
out.write_all(rb)?;
```

[`print!`](https://doc.rust-lang.org/std/macro.print.html) forces a UTF-8 round-trip through [`Display`](https://doc.rust-lang.org/std/fmt/trait.Display.html). [`Write::write_all`](https://doc.rust-lang.org/std/io/trait.Write.html#method.write_all) does not.
It writes the raw bytes directly to `stdout`.

### Pick the Right Type for the Job

For Unix-flavored systems code, use [`Path`](https://doc.rust-lang.org/std/path/struct.Path.html) and [`PathBuf`](https://doc.rust-lang.org/std/path/struct.PathBuf.html) for filesystem paths, [`OsString`](https://doc.rust-lang.org/std/ffi/struct.OsString.html) for environment variables, and `Vec<u8>` or `&[u8]` for stream contents. It's tempting to round-trip them through `String` for easier formatting, but that's the way the cookie crumbles.

UTF-8 is a great default for application strings but it's absolutely, positively the wrong default for the raw byte stuff Unix tools work with.

## Treat `panic!` as a Denial of Service

In a CLI, every `unwrap`, every `expect`, every slice index, every unchecked arithmetic, every [`from_utf8`](https://doc.rust-lang.org/std/str/fn.from_utf8.html) is a potential denial of service if an attacker can shape the input.
That's because a `panic!` unwinds the stack and aborts the process. If your tool is running in a cron job, a CI pipeline, or a shell script, that means the whole thing just stops working. Even worse, you could find yourself in a crash loop that can paralyze the entire system.

A canonical case from the audit was `sort --files0-from` (CVE-2026-35348).
Feed it a non-UTF-8 path and the whole pipeline aborts on a panic. Your nightly cron job is dead and there goes your weekend.

> In code that processes untrusted input, treat every `unwrap`, `expect`, indexing, or `as` cast as a CVE waiting to be filed. Use `?`, `get`, `checked_*`, `try_from`, and surface a real error. Push back on the boundary of your application and let the caller deal with the fallout.

A good lint baseline to catch this in CI.

```toml
[lints.clippy]
unwrap_used      = "warn"
expect_used      = "warn"
panic            = "warn"
indexing_slicing = "warn"
arithmetic_side_effects = "warn"
```

(These are noisy in test code, so turn them off there.)

## Propagate Every Error

A few CVEs come from ignoring or losing error information.

`chmod -R` and `chown -R` returned the exit code of the *last* file processed instead of the worst one. So `chmod -R 600 /etc/secrets/*` could fail on half the files and still exit `0`. Your script thinks everything's fine.

`dd` called [`Result::ok()`](https://doc.rust-lang.org/std/result/enum.Result.html#method.ok) on its [`set_len()`](https://doc.rust-lang.org/std/fs/struct.File.html#method.set_len) call to mimic GNU's behavior on `/dev/null`. The intent was reasonable, but that same code ran for regular files too, so a full disk silently produced a half-written destination.

The reason was that someone wanted to throw away a [`Result`](https://doc.rust-lang.org/std/result/enum.Result.html) and reached for `.ok()`, [`.unwrap_or_default()`](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or_default), or `let _ =`.
Here's a very simple pattern to avoid that:

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

Also, if you write `.ok()` to discard a `Result`, leave a comment that explains *why* this specific failure is safe to ignore.

## Match the Original Tool's Behavior Exactly

A surprising number of these CVEs aren't "the code does something unsafe" but "the code does something *different* from GNU, and a shell script somewhere relied on the GNU behavior."

The clearest example is `kill -1` (CVE-2026-35369). GNU reads `-1` as "signal 1" and asks for a PID. uutils read it as "send the default signal to PID -1", which on Linux means *every process you can see*. Yikes!

A typo becomes a system-wide kill switch.

> If you reimplement a battle-tested tool, bug-for-bug compatibility on exit codes, error messages, edge cases, and option semantics is a security feature. (Hello, [Hyrum's Law](https://www.hyrumslaw.com/)!)

Anywhere your behavior diverges from the original, somebody's shell script is making a wrong decision.

{{ figure(src="workflow_2x.jpg", caption="Workflow", credits="[XKCD 1172](https://xkcd.com/1172/)") }}

uutils now runs the upstream GNU coreutils test suite against itself in CI. That's the right scale of defense for this class of bug.

## Resolve Inputs Before Crossing a Trust Boundary

[CVE-2026-35368](https://ubuntu.com/security/CVE-2026-35368) is the worst single bug in the audit. It's local root code execution. And the best part is that you can't see it just by reading the code.

Here's the pattern.

```rust
chroot(new_root)?;
// Still uid 0, but now inside the attacker-controlled filesystem.
let user = get_user_by_name(name)?;
setgid(user.gid())?;
setuid(user.uid())?;
exec(cmd)?;
```

Huh. Looks innocent.

The trap is that `get_user_by_name` ends up loading shared libraries from the *new* root filesystem to resolve the username. An attacker who can plant a file in the chroot gets to run code as uid 0.

GNU `chroot` resolves the user *before* calling `chroot`. Same fix here.

```rust
let user = get_user_by_name(name)?;

chroot(new_root)?;
setgid(user.gid())?;
setuid(user.uid())?;
exec(cmd)?;
```

There's a general principle here that Rust can't help you with: **resolve everything you need *before* crossing into a less-trusted environment.** Once you're across, every library call might run the attacker's code.

## What Rust *Did* Prevent

I want to end on a more positive note.

Although the above bugs were real, it would be the wrong conclusion to say "See? Rust is just as buggy as C!"
None of the following bad things happened in the audit:

- No buffer overflows.
- No use-after-free.
- No double-free.
- No data races on shared mutable state.
- No null-pointer dereferences.
- No uninitialized memory reads.

That means, even if the tools were (and still are) buggy, they never had a bug that could be exploited to read arbitrary memory.

GNU coreutils has shipped CVEs in every single one of those categories. The Rust rewrite has shipped zero. That's *most* of what historically goes wrong in a C codebase.

What's left is, frankly, a more interesting class of bug. It lives at the boundary between our tidy Rust environment and the "messy outside world" where paths, bytes, strings, and syscalls are eternally tangled up in this ugly ball of sadness.
That's the new security boundary of modern systems code.

If you write systems code in Rust, treat this CVE list as a checklist. Grep your own codebase for `from_utf8_lossy`, stray `unwrap()` calls, discarded `Result`s, `File::create`, and string comparisons against `"/"`.

I also wrote a companion post, titled [Patterns for Defensive Programming in Rust](https://corrode.dev/blog/defensive-programming/) over on the company blog. Reach out if you need help applying these patterns to your codebase. Stay safe out there!