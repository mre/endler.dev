+++
title="Cursed Rust: Printing Things The Wrong Way"
date=2023-11-01
draft=false
[taxonomies]
tags=["dev", "rust"]
[extra]
subtitle="Let's have some fun with 'Hello, world!'"
+++

There is a famous story about a physicist during an exam at the University of
Copenhagen. The candidate was asked to describe how to determine a skyscraper's
height using a barometer. The student suggested dangling the barometer from the
building's roof using a string and then measuring the length of the string plus
the barometer's height. Although technically correct, the examiners were not
amused.

After a complaint and a reevaluation, the student offered various physics-based
solutions, ranging from dropping the barometer and calculating the building’s
height using the time of fall, to using the proportion between the lengths of
the building's shadow and that of the barometer to calculate the building's
height from the height of the barometer.
He even humorously suggested simply asking the caretaker in exchange for the
barometer. 

The physicist, as the legend goes, was [Niels Bohr](https://en.wikipedia.org/wiki/Niels_Bohr), who
went on to receive a Nobel Prize in 1922. This story is also known as the
[barometer question](https://en.wikipedia.org/wiki/Barometer_question).

## Why Is This Story Interesting?

The question and its possible answers have an important didactic side effect:
they convey to the learner that one can also get to the solution with unconventional
methods &mdash; and that these methods are often more interesting than the
canonical solution *because they reveal something about the problem itself*.

There is virtue in learning from unconventional answers to conventional questions.
To some extent, this fosters new ways of thinking and problem-solving, which is
an essential part of innovation. 

## Applying The Same Principle To Learning Rust

One of the first examples in any book on learning Rust is the "Hello, world!"
program.

```rust
fn main() {
    println!("Hello, world!");
}
```

It's an easy way to test that your Rust installation is working correctly.

However, we can also have some fun and turn the task on its head:
let's find ways to print "Hello, world!" in Rust that no sane person would ever use.

Let's try to come up with as many unconventional solutions for printing "Hello, world!"
as possible. The weirder, the better! As you go through each of the solutions
below, try to understand *why* they work and what you can learn from them.

[This started as a meme](https://www.reddit.com/r/rustjerk/comments/16xty71/s_str_print_shello/),
but I decided to turn it into a full article after seeing how engaging it was.

It goes without saying that you should never use any of these solutions in
production code. They are meant to be fun and educational only.

## Solution 1: Desugaring `println!`

```rust
use std::io::Write;

write!(std::io::stdout().lock(), "Hello, world!");
```

This solution is interesting, because it shows that `println!` is just a macro that
expands to a call to `write!` with a newline character appended to the string.

The real code is [much weirder](https://github.com/rust-lang/rust/blob/f3457dbf84cd86d284454d12705861398ece76c3/library/std/src/io/stdio.rs#L1097). Search for `print` in this file if you want to be amazed.
`write!` itself [desugars to a call to `write_fmt`](https://doc.rust-lang.org/std/fmt/trait.Write.html#method.write_fmt), which is a method of the `Write` trait. 

There is a real-world use case for this: if you want to print things really fast, you can
lock `stdout` once and then use `write!`. This avoids the overhead
of locking `stdout` for each call to `println!`. See [this article on how to write a very
fast version of `yes`](/2017/yes/) with this trick.

## Solution 2: Iterating Over Characters

```rust
"Hello, world!".chars().for_each(|c| print!("{}", c));
```

This shows that you can implement `println!` using Rust's powerful iterators.
Here we iterate over the characters of the string and print each one of them.

`chars()` returns an iterator over [Unicode scalar values](https://doc.rust-lang.org/std/primitive.char.html).

Learn more about iterators [here](https://doc.rust-lang.org/std/iter/trait.Iterator.html).

## Solution 3: Impl `Display`

```rust
struct HelloWorld;

impl std::fmt::Display for HelloWorld {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Hello, world!")
    }
}

println!("{HelloWorld}");
```

This teaches us a little bit about how traits work in Rust: We define a struct
that implements the `Display` trait, which allows us to print it using `print!`.
In general, `Display` is intended to make more complex types printable, but it
is also possible to implement it for a hardcoded string!

## Solution 4: Who Needs `Display`?

How about we create our own trait instead of using `Display`?

```rust
trait Println {
    fn println(&self);
}

impl Println for &str {
    fn println(&self) {
        print!("{}", self);
    }
}

"Hello, world!".println();
```

We can exploit the fact that we can name our trait methods however we want. In
this example, we choose `println`, making it look like it is part of the
standard library.

This completely turns the `println!` macro on its head. Instead of
passing a string as an argument, we call a method on the string itself!

## Solution 5: Who Needs `println!` When You Got `panic!`?

```rust
panic!("Hello, world!");
```

There are other ways to print things in Rust than using `println!`. In this
case, we use `panic!`, which prints the string (as a side-effect) and
immediately terminates the program. It works as long as we only want to print
a single string...

## Solution 6: I &#x2665;&#xFE0E;️ Closures

```rust
(|s: &str| print!("{}", s))("hello");
```

Rust allows you to call a closure directly after its
definition. The closure is defined as an anonymous function that takes a
string slice as an argument and prints it. The string slice is passed as an
argument to the closure.

In practice, this can be useful for defining a closure that is only used once
and for which you don't want to come up with a name.

## Solution 7: C Style

```rust
extern crate libc;
use libc::{c_char, c_int};
use core::ffi::CStr;

extern "C" {
    fn printf(fmt: *const c_char, ...) -> c_int;
}

fn main() {
    const HI: &CStr = match CStr::from_bytes_until_nul(b"hello\n\0") {
        Ok(x) => x,
        Err(_) => panic!(),
    };

    unsafe {
        printf(HI.as_ptr());
    }
}
```

You don't even need to use Rust's standard library to print things! This
example shows how to call the C standard library's `printf` function from Rust.
It's unsafe because we are using a raw pointer to pass the string to the
function. This teaches us a little bit about how FFI works in Rust.

Credit goes to [/u/pinespear on Reddit](https://www.reddit.com/r/rustjerk/comments/16xty71/s_str_print_shello/k36n6be/) and [@brk@infosec.exchange](https://infosec.exchange/@brk).

## Solution 8: C++ Style

We're well into psychopath territory now, so let's not stop here.
If you try extremely hard, you can bend Rust to your will and make it look
like C++.

```rust
use std::fmt::Display;
use std::ops::Shl;

#[allow(non_camel_case_types)]
struct cout;
#[allow(non_camel_case_types)]
struct endl;

impl<T: Display> Shl<T> for cout {
    type Output = cout;
    fn shl(self, data: T) -> Self::Output {
        print!("{}", data);
        cout
    }
}
impl Shl<endl> for cout {
    type Output = ();
    fn shl(self, _: endl) -> Self::Output {
        println!("");
    }
}

cout << "Hello World" << endl;
```

The `Shl` trait is used to implement the `<<` operator. The `cout`
struct implements `Shl` for any type that implements `Display`, which allows
us to print any printable type. The `endl` struct implements `Shl` for `cout`,
which prints the newline character in the end.

Credit goes to [Wisha Wanichwecharungruang](https://wisha.page/posts/fun-rust-operators/) for this
solution.

## Solution 9: Assembly! Unadulterated Control!

All of these high-level abstractions stand in the way of printing things
efficiently. We have to take back control of your CPU. Assembly is the way. No more wasted cycles.
No hidden instructions. Pure, unadulterated performance.

```rust
use std::arch::asm;

const SYS_WRITE: usize = 1;
const STDOUT: usize = 1;

fn main() {
    #[cfg(not(target_arch = "x86_64"))]
    panic!("This only works on x86_64 machines!");

    let phrase = "Hello, world!";
    let bytes_written: usize;
    unsafe {
        asm! {
            "syscall",
            inout("rax") SYS_WRITE => bytes_written,
            inout("rdi") STDOUT => _,
            in("rsi") phrase.as_ptr(),
            in("rdx") phrase.len(),
            // syscall clobbers these
            out("rcx") _,
            out("r11") _,
        }
    }

    assert_eq!(bytes_written, phrase.len());
}
```

([Rust Playground](https://play.rust-lang.org/?version=stable&mode=release&edition=2021&gist=d11b1f6ef0711681e1f5a613e5cf412b))

If you're wondering why we use Rust in the first place if all
we do is call assembly code, you're missing the point!
This is about way more than just printing things.
It is about freedom! Don't tell me how I should use my CPU.

Okaaay, it only works on x86_64 machines, but that's a small sacrifice to make
for freedom.

Submitted by [isaacthefallenapple](https://github.com/isaacthefallenapple).

## Solution 10: "Blazing Fast"

All of our shiny new cores are going unused. Why did we pay a premium for them
if we aren't using them? Wasn't fearless concurrency the promise of Rust? 
Let's fix that at once!

```rust
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

fn main() {
    let phrase = "hello world";
    let phrase = Arc::new(Mutex::new(phrase.chars().collect::<Vec<_>>()));

    let mut handles = vec![];

    for i in 0..phrase.lock().unwrap().len() {
        let phrase = Arc::clone(&phrase);
        let handle = thread::spawn(move || {
            thread::sleep(Duration::from_millis(((i + 1) * 100) as u64));
            print!("{}", phrase.lock().unwrap()[i]);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }
    println!();
}
```

Here, each character is printed in a separate thread. The threads are spawned
in a loop, and each thread sleeps for a certain amount of milliseconds before
printing its character. This uses the full power of your CPU to print a string!

## Your Turn!

If you've got more solutions, I'd love to hear them! Send me a message.

For production usage, check out this enterprise-ready version of
[hello world](https://github.com/mTvare6/hello-world.rs).
There also is a yearly obfuscated C code contest, which is a lot of fun. Check
out the [recent winners](https://ioccc.org/years.html).


If were more interested in the barometer story, check out [Surely You're Joking,
Mr. Feynman!](https://www.goodreads.com/book/show/35167685-surely-you-re-joking-mr-feynman),
a book by Richard Feynman, another famous physicist and Nobel Prize winner, who
was known for his unconventional thinking.

We should all strive to think outside the box and come up with unconventional
solutions to problems. Who knows, maybe that's the key to a deeper
understanding of the problem itself?
