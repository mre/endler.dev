+++
title="The `look` Unix command"
date=2022-08-10
draft=true
[taxonomies]
tags=["dev", "rust"]
+++

Chances are you never heard of the `look` Unix command &mdash; and yet it is
installed on your computer. Look! 👀 

```
> look rust
rust
rustable
rustful
rustic
rustical
rustically
rusticalness
rusticate
rustication
rusticator
rusticial
rusticism
...
```

It prints words that start with a prefix.

It's been around for a while, too. Since "Version 7 AT&T UNIX", according to `man look`.
That's like... 1979 (?) and I find out about it now. Oh well.

Anyhow, let's write a Rust thing, shall we?

```rust
use std::{
    error::Error,
    fs::File,
    io::{self, BufRead},
    path::Path,
};

const USAGE: &str = "usage: look [-df] [-t char] string [file ...]";

// https://doc.rust-lang.org/rust-by-example/std_misc/file/read_lines.html
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}
fn main() -> Result<(), Box<dyn Error>> {
    let prefix = std::env::args().nth(1).unwrap_or_else(|| {
        println!("{}", USAGE);
        std::process::exit(2);
    });

    for line in read_lines("/usr/share/dict/words")? {
        if let Ok(line) = line {
            if line.to_lowercase().starts_with(&prefix) {
                println!("{}", line);
            }
        }
    }

    Ok(())
}
```

That produces the same output on my MacBook than the system version.

```sh
> diff <(cargo run -- rust) <(look rust)
>
```

Is it equally fast?

```sh
> brew install hyperfine
```

```sh
> cargo build --release
> hyperfine --warmup 5 'look rust' 'target/release/lookrs rust'
Benchmark #1: look rust
  Time (mean ± σ):       4.4 ms ±   6.9 ms    [User: 0.7 ms, System: 1.2 ms]
  Range (min … max):     0.0 ms …  25.4 ms    123 runs
 
Benchmark #2: target/release/lookrs rust
  Time (mean ± σ):      82.6 ms ±  12.9 ms    [User: 73.5 ms, System: 2.7 ms]
  Range (min … max):    63.0 ms … 111.7 ms    33 runs
 
Summary
  'look rust' ran
   18.92 ± 30.14 times faster than 'target/release/lookrs rust'
```

Huh, my naive version is about 20x slower.
I just remember that [ripgrep](https://github.com/BurntSushi/ripgrep) could also be used for that.
It supports `\b` to denote word boundaries:

```sh
> rg '\brust' /usr/share/dict/words
```

Checking with hyperfine, it's 3x slower than `look`:

```sh
> hyperfine --warmup 5 'rg '\brust' /usr/share/dict/words'                                                                                                               ✘
Benchmark #1: rg brust /usr/share/dict/words
  Time (mean ± σ):      12.3 ms ±   7.4 ms    [User: 3.9 ms, System: 2.9 ms]
  Range (min … max):     4.4 ms …  26.6 ms    198 runs
```

The `look` manpage gives a hint:

> **As look performs a binary search, the lines in file must be sorted.**

And indeed if we randomize the input, `look` becomes completely useless:

```sh
> cat /usr/share/dict/words | sort -R > random.txt
> look rust random.txt
*Crickets. No output*
```

(Note that you *might* get some results based on the randomization.)

Back in the 70s storage was expensive and CPUs were slow, so requiring a sorted file allowed for much shorter seek times.

Let's peek into [the `look` Darwin source code](https://opensource.apple.com/source/text_cmds/text_cmds-106/look/look.c.auto.html) to see how they do it, shall we?

The interesting bit is here where they first do a binary search and then a linear search until they reach `back`.

```c
int
look(wchar_t *string, unsigned char *front, unsigned char *back)
{
	front = binary_search(string, front, back);
	front = linear_search(string, front, back);

	if (front)
		print_from(string, front, back);
	return (front ? 0 : 1);
}
```

* The first call, `binary_search`, "return[s] a pointer to the start of a line at
*or before* the first word matching `string`."
* After that, `linear_search` "find[s] the first line that starts with string, linearly searching from front to back."
* Finally, we print the lines until we reach `back`.

Another cool trick they use is `mmap` to reduce file IO:

```c
if ((front = mmap(NULL, (size_t)sb.st_size, PROT_READ, MAP_SHARED, fd, (off_t)0)) == MAP_FAILED)
        err(2, "%s", file);
```

An `mmap` is a read-only memory map backed by a file &mdash; - a "view" into memory if you like.


## We can do that, too! 💪

...but please without bending pointers along the way.
Enter [Mmap](https://docs.rs/memmap/latest/memmap/struct.Mmap.html)

http://pts.github.io/pts-line-bisect/line_bisect_evolution.html


TODO: Add diagram for comparison of linear search and binary search by file size

```
|
|    /
|   /
|  /   -----------------
| / _/
|/_/
+------------------------------------
```
