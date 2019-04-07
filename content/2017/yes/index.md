+++
title="A Little Story About the `yes` Unix Command"
date=2017-10-10

[extra]
comments = [
  {name = "Reddit", url = "https://www.reddit.com/r/rust/comments/75fll1/a_little_story_about_the_yes_unix_command/"},
  {name = "Hacker News", url = "https://news.ycombinator.com/item?id=15454352"},
]
translations = [
  {name = "Japanese", url = "http://postd.cc/a-little-story-about-the-yes-unix-command/"}
]
+++


What's the simplest Unix command you know?  
There's `echo`, which prints a string to stdout and `true`, which always terminates with an exit code of 0.

Among the rows of simple Unix commands, there's also `yes`.
If you run it without arguments, you get an infinite stream of y's, separated by a newline:

```
y
y
y
y
(...you get the idea)
```

What seems to be pointless in the beginning turns out to be pretty helpful  :

```
yes | sh boring_installation.sh
```

Ever installed a program, which required you to type "y" and hit enter to keep going?
`yes` to the rescue! It will carefully fulfill this duty, so you can keep watching [Pootie Tang](https://www.youtube.com/watch?v=yhBExhldRXQ).


## Writing yes

Here's a basic version in... uhm... BASIC.

```
10 PRINT "y"
20 GOTO 10
```

And here's the same thing in Python:

```python
while True:
    print("y")
```

Simple, eh? Not so quick!  
Turns out, that program is quite slow. 

```
python yes.py | pv -r > /dev/null
[4.17MiB/s]
```

Compare that with the built-in version on my Mac:

```
yes | pv -r > /dev/null
[34.2MiB/s]
```

So I tried to write a quicker version in Rust. Here's my first attempt:

```rust
use std::env;

fn main() {
  let expletive = env::args().nth(1).unwrap_or("y".into());
  loop {
    println!("{}", expletive);
  }
}
```

Some explanations:

* The string we want to print in a loop is the first command line parameter and is named *expletive*. I learned this word from the `yes` manpage.
* I use `unwrap_or` to get the *expletive* from the parameters. In case the parameter is not set, we use "y" as a default.
* The default parameter gets converted from a string slice (`&str`) into an *owned* string on the heap (`String`) using `into()`.


Let's test it.

```
cargo run --release | pv -r > /dev/null
   Compiling yes v0.1.0
    Finished release [optimized] target(s) in 1.0 secs
     Running `target/release/yes`
[2.35MiB/s] 
```

Whoops, that doesn't look any better. It's even slower than the Python version!
That caught my attention, so I looked around for the source code of a C implementation.

Here's the [very first version of the program](https://github.com/dspinellis/unix-history-repo/blob/4c37048d6dd7b8f65481c8c86ef8cede2e782bb3/usr/src/cmd/yes.c), released with Version 7 Unix and famously authored by Ken Thompson on <nobr>Jan 10, 1979</nobr>:

```c
main(argc, argv)
char **argv;
{
  for (;;)
    printf("%s\n", argc>1? argv[1]: "y");
}
```

No magic here.

Compare that to the [128-line-version from the GNU coreutils, which is mirrored on Github](https://github.com/coreutils/coreutils/blame/master/src/yes.c). After 25 years, *it is still under active development!*
The last code change happened around a [year ago](https://github.com/coreutils/coreutils/commit/4cdb1703aff044de44d27e0558714542197f6dad).
That's quite fast:

```
# brew install coreutils
gyes | pv -r > /dev/null 
[854MiB/s]
```

The important part is at the end:

```c
/* Repeatedly output the buffer until there is a write error; then fail.  */
while (full_write (STDOUT_FILENO, buf, bufused) == bufused)
  continue;
```

Aha! So they simply use a buffer to make write operations faster.
The buffer size is defined by a constant named `BUFSIZ`, which gets chosen on each system so as to make I/O efficient (see [here](https://www.gnu.org/software/libc/manual/html_node/Controlling-Buffering.html)).
On my system, that was defined as 1024 bytes. I actually had better performance with 8192 bytes.

I've extended my Rust program:

```rust
use std::env;
use std::io::{self, BufWriter, Write};

const BUFSIZE: usize = 8192;

fn main() {
    let expletive = env::args().nth(1).unwrap_or("y".into());
    let mut writer = BufWriter::with_capacity(BUFSIZE, io::stdout());
    loop {
        writeln!(writer, "{}", expletive).unwrap();
    }
}
```

The important part is, that the buffer size is a multiple of four, to ensure [memory alignment](https://stackoverflow.com/a/381368/270334).

Running that gave me 51.3MiB/s.
Faster than the version, which comes with my system, but still way slower than the results from [this Reddit post](https://www.reddit.com/r/unix/comments/6gxduc/how_is_gnu_yes_so_fast/) that I found, where the author talks about 10.2GiB/s.

## Update

Once again, the Rust community did not disappoint.  
As soon as this post [hit the Rust subreddit](https://www.reddit.com/r/rust/comments/75fll1/a_little_story_about_the_yes_unix_command/), user [nwydo](https://www.reddit.com/user/nwydo) pointed out a [previous discussion](https://www.reddit.com/r/rust/comments/4wde08/optimising_yes_any_further_ideas/) on the same topic.
Here's their optimized code, that breaks the 3GB/s mark on my machine:

```rust
use std::env;
use std::io::{self, Write};
use std::process;
use std::borrow::Cow;

use std::ffi::OsString;
pub const BUFFER_CAPACITY: usize = 64 * 1024;

pub fn to_bytes(os_str: OsString) -> Vec<u8> {
  use std::os::unix::ffi::OsStringExt;
  os_str.into_vec()
}

fn fill_up_buffer<'a>(buffer: &'a mut [u8], output: &'a [u8]) -> &'a [u8] {
  if output.len() > buffer.len() / 2 {
    return output;
  }

  let mut buffer_size = output.len();
  buffer[..buffer_size].clone_from_slice(output);

  while buffer_size < buffer.len() / 2 {
    let (left, right) = buffer.split_at_mut(buffer_size);
    right[..buffer_size].clone_from_slice(left);
    buffer_size *= 2;
  }

  &buffer[..buffer_size]
}

fn write(output: &[u8]) {
  let stdout = io::stdout();
  let mut locked = stdout.lock();
  let mut buffer = [0u8; BUFFER_CAPACITY];

  let filled = fill_up_buffer(&mut buffer, output);
  while locked.write_all(filled).is_ok() {}
}

fn main() {
  write(&env::args_os().nth(1).map(to_bytes).map_or(
    Cow::Borrowed(
      &b"y\n"[..],
    ),
    |mut arg| {
      arg.push(b'\n');
      Cow::Owned(arg)
    },
  ));
  process::exit(1);
}
```

Now that's a whole different ballgame!

* We prepare a filled string buffer, which will be reused for each loop.
* [Stdout is protected by a lock](https://doc.rust-lang.org/std/io/struct.Stdout.html#method.lock). So, instead of constantly acquiring and releasing it, we keep it all the time.
* We use a the platform-native [`std::ffi::OsString`](https://doc.rust-lang.org/std/ffi/struct.OsString.html) and [`std::borrow::Cow`](https://doc.rust-lang.org/std/borrow/enum.Cow.html) to avoid unnecessary allocations.

The only thing that I could contribute was [removing an unnecessary `mut`](https://github.com/cgati/yes/pull/3/files). 😅

## Lessons learned

The trivial program `yes` turns out not to be so trivial after all.
It uses output buffering and memory alignment to improve performance.
Re-implementing Unix tools is fun and makes me appreciate the nifty tricks,
which make our computers fast.