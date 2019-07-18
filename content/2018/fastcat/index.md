+++
title="fastcat - A Faster `cat` Implementation Using Splice"
date=2018-07-31

[extra]
excerpt="""
Lots of people asked me to write another piece about the internals of well-known Unix commands. Well, actually, nobody asked me, but it makes for a good intro. I'm sure you’ve read the previous parts about `yes` and `ls` &mdash; they are epic.
"""
social_img="2018_fastcat.png"
comments = [
  {name = "Reddit", url = "https://www.reddit.com/r/rust/comments/93fbrj/fascat_a_faster_cat_implementation_using_splice/"},
  {name = "Lobsters", url = "https://lobste.rs/s/vmucxl/fastcat_faster_cat_implementation_using"},
  {name = "HackerNews", url = "https://news.ycombinator.com/item?id=17657485"},
]
+++

![fastcat logo](./fastcat.svg)

Lots of people asked me to write another piece about the internals of well-known
Unix commands. Well, actually, nobody asked me, but it makes for a good
intro. I'm sure you’ve read the previous parts about [`yes`](@/2017/yes/index.md) and
[`ls`](@/2018/ls/index.md) &mdash; they are epic.

Anyway, today we talk about `cat`, which is used to concatenate files - or, more
commonly, abused to print a file's contents to the screen.

```sh
# Concatenate files, the intended purpose
cat input1.txt input2.txt input3.txt > output.txt

# Print file to screen, the most common use case
cat myfile
```


## Implementing cat

Here's a naive `cat` in Ruby:

```ruby
#!/usr/bin/env ruby

def cat(args)
  args.each do |arg|
    IO.foreach(arg) do |line|
      puts line
    end
  end
end

cat(ARGV)
```

This program goes through each file and prints its contents line by line.
Easy peasy! But wait, how fast is this tool?

I quickly created a random 2 GB file for the benchmark.

Let's compare the speed of our naive implementation with the system one
using the awesome [pv](http://www.ivarch.com/programs/pv.shtml) (Pipe Viewer) tool.
All tests are averaged over five runs on a warm cache (file in memory).

```
# Ruby 2.5.1
> ./rubycat myfile | pv -r > /dev/null
[196MiB/s]
```

Not bad, I guess? How does it compare with my system's cat?

```
cat myfile | pv -r > /dev/null
[1.90GiB/s]
```

Uh oh, [GNU cat](http://git.savannah.gnu.org/gitweb/?p=coreutils.git;a=blob;f=src/cat.c;h=3c319511c767f65d2e420b3bff8fa6197ddbb37b;hb=HEAD) is **ten times faster** than our little Ruby cat. 🐌

## Making our Ruby cat a little faster

Our naive Ruby code can be tweaked a bit.
Turns out line buffering hurts performance in the end<sup><a href="#fn1" id="ref1">1</a></sup>:

```ruby
#!/usr/bin/env ruby

def cat(args)
  args.each do |arg|
    IO.copy_stream(arg, STDOUT)
  end
end

cat(ARGV)
```

```
rubycat myfile | pv -r > /dev/null
[1.81GiB/s]
```

Wow... we didn't really try hard, and we're already approaching the speed of a
tool that gets optimized [since
1971](https://en.wikipedia.org/wiki/Cat_(Unix)). 🎉

But before we celebrate too much, let's see if we can go even faster.

## Splice

What initially motivated me to write about `cat` was [this comment by user
wahern on
HackerNews](https://news.ycombinator.com/item?id=15455897):

> I'm surprised that neither GNU yes nor GNU cat uses splice(2).

Could this *splice* thing make printing files even faster? &mdash; I was intrigued.

Splice was first introduced to the Linux Kernel in 2006, and there is a nice
[summary from Linus Torvalds himself](https://web.archive.org/web/20130305002825/http://kerneltrap.org/node/6505),
but I prefer the description from the [manpage](http://man7.org/linux/man-pages/man2/splice.2.html):

> **splice()** moves data between two file descriptors without copying
> between kernel address space and user address space.  It transfers up
> to len bytes of data from the file descriptor fd_in to the file
> descriptor fd_out, where one of the file descriptors must refer to a
> pipe.

If you really want to dig deeper, here's the corresponding [source code from the
Linux Kernel](
https://github.com/torvalds/linux/blob/6ed0529fef09f50ef41d396cb55c5519e4936b16/fs/splice.c),
but we don't need to know all the nitty-gritty details for now.
Instead, we can just inspect the [header from the C implementation](http://webcache.googleusercontent.com/search?q=cache:OfSsRQea29gJ:www.sourcexr.com/articles/2014/02/23/avoid-data-copy-with-splice+&cd=1&hl=de&ct=clnk&gl=de):

```C
#include <fcntl.h>

ssize_t splice (int fd_in, loff_t *off_in, int fd_out,
                loff_t *off_out, size_t len,
                unsigned int flags);
```

To break it down even more, here's how we would copy the entire `src` file to `dst`:

```C
const ssize_t r = splice (src, NULL, dst, NULL, size, 0);
```

The cool thing about this is that all of it happens inside the Linux kernel, which means we won't copy a single byte to userspace (where our program runs).
Ideally, splice works by remapping pages and does not actually copy
any data, which may improve I/O performance
([reference](https://en.wikipedia.org/wiki/Splice_(system_call))).

{{ figure(src="./buffers.png", credits="File icon by Aleksandr Vector from the Noun Project. Terminal icon by useiconic.com from the Noun Project.") }} 

## Using splice from Rust

I have to say I'm not a C programmer and I prefer Rust because it offers a safer
interface. [Here's the same thing in Rust](https://github.com/nix-rust/nix/blob/ebf75050f2f2726808308f76253f27c97aa6db15/src/fcntl.rs#L320-L329):

```rust
#[cfg(any(target_os = "linux", target_os = "android"))]
pub fn splice(
    fd_in: RawFd,
    off_in: Option<&mut libc::loff_t>,
    fd_out: RawFd,
    off_out: Option<&mut libc::loff_t>,
    len: usize,
    flags: SpliceFFlags,
) -> Result<usize>
```

Now I didn't implement the Linux bindings myself. Instead, I just used a library called
[nix](https://github.com/nix-rust/nix), which provides Rust friendly bindings to *nix APIs.

There is one caveat, though:
We cannot really copy the file directly to standard out, because splice
requires one file descriptor to be a pipe.
The way around that is to create a pipe, which consists of a reader and a
writer (`rd` and `wr`).
We pipe the file into the writer, and then we read from the pipe and push the data to stdout.

You can see that I use a relatively big buffer of 16384 bytes (2<sup>14</sup>) to improve performance.

```rust
extern crate nix;

use std::env;
use std::fs::File;
use std::io;
use std::os::unix::io::AsRawFd;

use nix::fcntl::{splice, SpliceFFlags};
use nix::unistd::pipe;

const BUF_SIZE: usize = 16384;

fn main() {
    for path in env::args().skip(1) {
        let input = File::open(&path).expect(&format!("fcat: {}: No such file or directory", path));
        let (rd, wr) = pipe().unwrap();
        let stdout = io::stdout();
        let _handle = stdout.lock();

        loop {
            let res = splice(
                input.as_raw_fd(),
                None,
                wr,
                None,
                BUF_SIZE,
                SpliceFFlags::empty(),
            ).unwrap();

            if res == 0 {
                // We read 0 bytes from the input,
                // which means we're done copying.
                break;
            }

            let _res = splice(
                rd,
                None,
                stdout.as_raw_fd(),
                None,
                BUF_SIZE,
                SpliceFFlags::empty(),
            ).unwrap();
        }
    }
}
```

So, how fast is this?

```
fcat myfile | pv -r > /dev/null
[5.90GiB/s]
```

Holy guacamole. That's **over three times as fast as system cat**.

## Operating System support

* **Linux** and **Android** are fully supported.
* **[OpenBSD](https://stackoverflow.com/questions/12230316/do-other-operating-systems-implement-the-linux-system-call-splice?lq=1)**
  also has some sort of splice implementation called
  [`sosplice`](http://man.openbsd.org/sosplice). I haven't tested that, though.
* On **macOS**, the closest thing to splice is its bigger brother,
  [sendfile](https://www.unix.com/man-page/osx/2/sendfile/), which can send a
  file to a socket within the Kernel. Unfortunately, it does not support sending
  from file to file.<sup><a href="#fn2" id="ref2">2</a></sup> There's also
  [`copyfile`](https://web.archive.org/web/20180401103335/https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man3/copyfile.3.html),
  which has a similar interface, but unfortunately, it is not zero-copy. (I
  thought so in the beginning, but [I was
  wrong](https://github.com/rust-lang/libc/pull/886).)
* **Windows** doesn't provide zero-copy file-to-file transfer
  (only file-to-socket transfer using the [TransmitFile API](https://docs.microsoft.com/en-us/windows/desktop/api/mswsock/nf-mswsock-transmitfile)).
  
Nevertheless, in a production-grade
implementation, the splice support could be activated on systems that support
it, while using a generic implementation as a fallback.

## Nice, but why on earth would I want that?

I have no idea. Probably you don't, because your bottleneck is somewhere else.
That said, many people use `cat` for piping data into another process like

```sh
# Count all lines in C files
cat *.c | wc -l
```

or

```sh
cat kittens.txt | grep "dog"
```

In this case, if you notice that `cat` is the bottleneck try `fcat` (but first,
[try to avoid `cat` altogether](http://porkmail.org/era/unix/award.html)).

With some more work, `fcat` could also be used to directly route packets from one
network card to another, [similar to netcat](http://nc110.sourceforge.net/). 

## Lessons learned

* The closer we get to bare metal, the more our hard-won abstractions fall
  apart, and we are back to low-level systems programming.
* Apart from a fast cat, there's also a use-case for a slow cat: old computers.
  For that purpose, there's... well.. [slowcat](https://grox.net/software/mine/slowcat/).
  
That said, I still have no idea why GNU cat does not use splice on Linux. 🤔
The [source code for fcat is on Github](https://github.com/mre/fcat).
Contributions welcome!

**Thanks** to [Olaf Gladis](https://twitter.com/hwmrocker) for helping me run the benchmarks on his Linux machine and to [Patrick Pokatilo](https://github.com/SHyx0rmZ) and [Simon Brüggen](https://github.com/m3t0r) for reviewing drafts of this article.


## Footnotes

<sup id="fn1">1. Thanks to reader <a href="https://www.reddit.com/r/rust/comments/93fbrj/fascat_a_faster_cat_implementation_using_splice/e3d2chn/">Freeky</a> for making this code more idiomatic.<a href="#ref1" title="Jump back to footnote 1 in the text.">↩</a></sup>  
<sup id="fn2">2. Thanks to reader <a href="https://www.reddit.com/r/rust/comments/93fbrj/fascat_a_faster_cat_implementation_using_splice/e3cu3rk/">masklinn</a> for the hint.<a href="#ref2" title="Jump back to footnote 2 in the text.">↩</a></sup>  