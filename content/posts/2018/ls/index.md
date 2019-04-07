+++
title="A Tiny `ls` Clone Written in Rust"
date=2018-03-09

[extra]
comments = [
  {name = "Reddit", url = "https://www.reddit.com/r/rust/comments/83tvpm/a_tiny_ls_clone_written_in_rust/"},
  {name = "Twitter", url = "https://twitter.com/matthiasendler/status/972170717663031296"},
]
+++


In my series of [useless Unix tools rewritten in Rust](./posts/2017/yes/index.md), today I'm going to be covering one of my all-time favorites: `ls`.

First off, let me say that you probably don't want to use this code as a replacement for `ls` on your local machine (although you could!).
As we will find out, `ls` is actually quite a powerful tool under the hood.
I'm not going to come up with a full rewrite, but instead only cover the very basic output that you would expect from calling `ls -l` on your command line.
What is this output? I'm glad you asked.

## Expected output


```
> ls -l
drwxr-xr-x 2 mendler  staff    13468 Feb  4 11:19 Top Secret
-rwxr--r-- 1 mendler  staff  6323935 Mar  8 21:56 Never Gonna Give You Up - Rick Astley.mp3
-rw-r--r-- 1 mendler  staff        0 Feb 18 23:55 Thoughts on Chess Boxing.doc
-rw-r--r-- 1 mendler  staff   380434 Dec 24 16:00 nobel-prize-speech.txt
```

Your output may vary, but generally, there are a couple of notable things going on. From left to right, we've got the following fields:

* The `drwx` things in the beginning are the *file permissions* (also called the file mode). If `d` is set, it's a directory. `r` means read, `w` means write and `x` execute.
  This `rwx` pattern gets repeated three times for the current user, the group, and other computer users respectively.
* Next we got the hardlink count when referring to a file, or the number of contained directory entries when referring to a directory. ([Reference](https://unix.stackexchange.com/a/43047))
* Owner name
* Group name
* Number of bytes in the file
* Date when the file was last modified
* Finally, the path name

For more in-depth information, I can recommend reading the manpage of `ls` from the [GNU coreutils](http://man7.org/linux/man-pages/man1/ls.1.html) used in most Linux distributions and the one from [Darwin](https://web.archive.org/web/20170909164539/https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man1/ls.1.html) (which powers MacOS). 

Whew, that's a lot of information for such a tiny tool.
But then again, it can't be so hard to port that to Rust, right? Let's get started!

## A very basic `ls` in Rust

Here is the most bare-bones version of `ls`, which just prints all files in the current directory:

```rust
use std::fs;
use std::path::Path;
use std::error::Error;
use std::process;

fn main() {
	if let Err(ref e) = run(Path::new(".")) {
		println!("{}", e);
		process::exit(1);
	}
}

fn run(dir: &Path) -> Result<(), Box<Error>> {
	if dir.is_dir() {
		for entry in fs::read_dir(dir)? {
				let entry = entry?;
				let file_name = entry
						.file_name()
						.into_string()
						.or_else(|f| Err(format!("Invalid entry: {:?}", f)))?;
				println!("{}", file_name);
		}
	}
	Ok(())
}

```

We can copy that straight out of the [documentation](https://doc.rust-lang.org/std/fs/fn.read_dir.html#examples).
When we run it, we get the expected output:

```
> cargo run
Cargo.lock
Cargo.toml
src
target
```

It prints the files and exits. Simple enough.

We should stop for a moment and celebrate our success, knowing that we just wrote our first little Unix utility from scratch.
*Pro Tip*: You can install the binary with `cargo install` and call it like any other binary from now on.

But we have higher goals, so let's continue.


## Adding a parameter to specify the directory 

Usually, if we type `ls mydir`, we expect to get the file listing of no other directory than `mydir`. We should add the same functionality to our version.

To do this, we need to accept command line parameters.
One Rust crate that I love to use in this case is [structopt](https://github.com/TeXitoi/structopt). It makes argument parsing very easy.

Add it to your `Cargo.toml`. (You need cargo-edit for the following command).

```
cargo add structopt
```

Now we can import it and use it in our project:

```rust
#[macro_use]
extern crate structopt;

// use std::...
use structopt::StructOpt;

#[derive(StructOpt, Debug)]
struct Opt {
	/// Output file
	#[structopt(default_value = ".", parse(from_os_str))]
	path: PathBuf,
}

fn main() {
	let opt = Opt::from_args();
	if let Err(ref e) = run(&opt.path) {
			println!("{}", e);
			process::exit(1);
	}
}

fn run(dir: &PathBuf) -> Result<(), Box<Error>> {
	// Same as before
}
```

By adding the `Opt` struct, we can define the command line flags, input parameters, and the `help` output super easily.
There are tons of configuration options, so it's worth checking out the [project homepage](https://github.com/TeXitoi/structopt).

Also note, that we changed the type of the path variable from `Path` to `PathBuf`. The difference is, that [`PathBuf` owns the inner path string](https://doc.rust-lang.org/src/std/path.rs.html#1107-1109), while `Path` [simply provides a reference to it](https://doc.rust-lang.org/src/std/path.rs.html#1629-1631). The relationship is similar to `String` and `&str`.


## Reading the modification time

Now let's deal with the metadata.
First, we try to retrieve the modification time from the file.
A quick look at [the documentation](https://doc.rust-lang.org/stable/std/fs/struct.Metadata.html) shows us how to do it:

```rust
use std::fs;

let metadata = fs::metadata("foo.txt")?;

if let Ok(time) = metadata.modified() {
	println!("{:?}", time);
}
```

The output might not be what you expect: we receive a [`SystemTime`](https://doc.rust-lang.org/stable/std/time/struct.SystemTime.html) object, which represents the measurement of the system clock. E.g. [this code](https://play.rust-lang.org/?gist=96e18ed541abe896f761d601cdf50561&version=stable)

```rust
println!("{:?}", SystemTime::now());
// Prints: SystemTime { tv_sec: 1520554933, tv_nsec: 610406401 }
```

But the format that we would like to have is something like this:

```rust
Mar  9 01:24
```

Thankfully, there is a library called `chrono`, which can read this format and [convert it into any human readable output]() we like:

```rust
let current: DateTime<Local> = DateTime::from(SystemTime::now());
println!("{}", current.format("%_d %b %H:%M").to_string());
```

this prints

```
9 Mar 01:29
```

(Yeah, I know it's getting late.)


Armed with that knowledge, we can now read our file modification time.

```
cargo add chrono
```

```rust
use chrono::{DateTime, Local};

fn run(dir: &PathBuf) -> Result<(), Box<Error>> {
	if dir.is_dir() {
		for entry in fs::read_dir(dir)? {
			let entry = entry?;
			let file_name = ...

			let metadata = entry.metadata()?;
			let size = metadata.len();
			let modified: DateTime<Local> = DateTime::from(metadata.modified()?);

			println!(
				"{:>5} {} {}",
				size,
				modified.format("%_d %b %H:%M").to_string(),
				file_name
			);
		}
	}
	Ok(())
}
```

This `{:>5}` might look weird. It's a formatting directive provided by [`std::fmt`](https://doc.rust-lang.org/std/fmt/).
It means "right align this field with a space padding of 5" - just like our bigger brother `ls -l` is doing it.

Similarly, we retrieved the size in bytes with `metadata.len()`.


## Unix file permissions are a zoo

Reading the file permissions is a bit more tricky.
While the `rwx` notation is very common in Unix derivatives such as \*BSD or GNU/Linux, many other operating systems ship their own permission management.
There are even [differences between the Unix derivatives](https://en.wikipedia.org/wiki/File_system_permissions).

Wikipedia lists a few extensions to the file permissions that you might encounter:

* \+ (plus) suffix indicates an [access control list](https://en.wikipedia.org/wiki/Access_control_list) that can control additional permissions.
* . (dot) suffix indicates an [SELinux context](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/security-enhanced_linux/chap-security-enhanced_linux-selinux_contexts) is present. Details may be listed with the command ls -Z.
* @ suffix indicates [extended file attributes](https://en.wikipedia.org/wiki/Extended_file_attributes) are present.

That just goes to show, that there are a lot of important details to be considered when implementing this in real life.

## Implementing very basic file mode

For now, we just stick to the basics and assume we are on a platform that supports the `rwx` file mode.

Behind the `r`, the `w` and the `x` are in reality octal numbers. That's easier for computers to work with and many hardcore users even prefer to type the numbers over the symbols.
The ruleset behind those octals is as follows. I took that from the `chmod` manpage.

		Modes may be absolute or symbolic. 
		An absolute mode is an octal number constructed 
		from the sum of one or more of the following values

		 0400    Allow read by owner.
		 0200    Allow write by owner.
		 0100    For files, allow execution by owner.
		 0040    Allow read by group members.
		 0020    Allow write by group members.
		 0010    For files, allow execution by group members.
		 0004    Allow read by others.
		 0002    Allow write by others.
		 0001    For files, allow execution by others.

For example, to set the permissions for a file so that the owner can read, write and execute it and nobody else can do anything would be 700 (400 + 200 +100).

Granted, those numbers are the same since the 70s and are not going to change soon, but it's still a bad idea to compare our file permissions directly with the values; if not for compatibility reasons, then for readability and to avoid magic numbers in our code.

Therefore, we use the `libc` crate, which provides constants for those magic numbers.
As mentioned above, these file permissions are Unix specific, so we need to import a Unix-only library named [`std::os::unix::fs::PermissionsExt;`](https://doc.rust-lang.org/std/os/unix/fs/trait.PermissionsExt.html) for that.

```rust
extern crate libc;

// Examples:
// * `S_IRGRP` stands for "read permission for group",
// * `S_IXUSR` stands for "execution permission for user"
use libc::{S_IRGRP, S_IROTH, S_IRUSR, S_IWGRP, S_IWOTH, S_IWUSR, S_IXGRP, S_IXOTH, S_IXUSR};
use std::os::unix::fs::PermissionsExt;
```

We can now get the file permissions like so:

```rust
let metadata = entry.metadata()?;
let mode = metadata.permissions().mode();
parse_permissions(mode as u16);
```

`parse_permissions()` is a little helper function defined as follows:

```rust
fn parse_permissions(mode: u16) -> String {
	let user = triplet(mode, S_IRUSR, S_IWUSR, S_IXUSR);
	let group = triplet(mode, S_IRGRP, S_IWGRP, S_IXGRP);
	let other = triplet(mode, S_IROTH, S_IWOTH, S_IXOTH);
	[user, group, other].join("")
}
```

It takes the file mode as a `u16` (simply because the libc constants are `u16`)
and calls `triplet` on it.
For each flag `read`, `write`, and `execute`, it runs a binary `&` operation on `mode`.
The output is matched exhaustively against all possible permission patterns.


```rust
fn triplet(mode: u16, read: u16, write: u16, execute: u16) -> String {
	match (mode & read, mode & write, mode & execute) {
		(0, 0, 0) => "---",
		(_, 0, 0) => "r--",
		(0, _, 0) => "-w-",
		(0, 0, _) => "--x",
		(_, 0, _) => "r-x",
		(_, _, 0) => "rw-",
		(0, _, _) => "-wx",
		(_, _, _) => "rwx",
	}.to_string()
}
```

## Wrapping up

The final output looks like this. Close enough.

```
> cargo run
rw-r--r--     7  6 Mar 23:10 .gitignore
rw-r--r-- 15618  8 Mar 00:41 Cargo.lock
rw-r--r--   185  8 Mar 00:41 Cargo.toml
rwxr-xr-x   102  5 Mar 21:31 src
rwxr-xr-x   136  6 Mar 23:07 target
```

That's it! You can find the [final version of our toy `ls` on Github](https://gist.github.com/mre/91ebb841c34df69671bd117ead621a8b).
We are still far away from a full-fledged `ls` replacement, but at least we learned a thing or two about its internals.

If you're looking for a proper `ls` replacement written in Rust, go check out [`exa`](https://the.exa.website/).
If, instead, you want to read another blog post from the same series, check out [*A Little Story About the `yes` Unix Command*](./posts/2017/yes/index.md).