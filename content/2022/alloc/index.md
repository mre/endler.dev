+++
title="Allocations in Rust"
date=2022-11-04
draft=true

[taxonomies]
tags=["rust"]

[extra]
subtitle="And How To Avoid Them"
+++

One of the neatest things about Rust is that you have _full control over memory
management_ and can deep-dive into performance optimizations at will.

In that context you might have heard terms like _zero-copy_ or _allocation-free_
code, alas, you might have wondered, what that really meant.

Information on the topic is surprisingly sparse, so to save you the trouble,
I decided to write down all I've learned so far.

## Who Is This Article For?

Memory management internals are an intermediate topic, but you don't need to
know a lot about allocations to be productive in Rust. It can be fun and
educational to learn more, however!

So this is for everyone who wants to know more about <u>allocations</u> in
<u>Rust</u>.

## Table Of Contents

## Why Should I Care?

Hold on a sec!

I made it sound like you should know all about memory allocations (admittedly a
bold topic of conversation for a dinner party) but what's the point? After all,
isn't that something that the compiler and runtime takes care of?

Indeed it is very convenient to use a language that takes care of memory
management, until you hit a wall:
And it can be frustrating if to wrangle with the language's limitations in the
face of a performance bottleneck, a memory leak, or a hardward limitation.
You silently might nod in agreement if you've ever been in such a situation.

Rust, in contrast, never hides any low-level details from you.
It requires you to understand how memory works, because you need to be
explicit about how you want to use it.
Then again, Rust is not the only language that does that.
Infamously, C also requires you to manage memory yourself.
However, crucially, Rust's memory model is _safe_. Its static code analysis
ensures that you don't make too much of a mess. In contrast, C almost
feels like it actively tries to ambush you; edge-cases and undefined behavior
around every corner.

In summary, Rust is a great language to learn more about memory management,
because it's safe but does not hide any details from you.

## What's An Allocation?

The origin of _allocation_ is not widely known, despite being commonly used.
The word comes from _Vulgar Latin_ [_allocare_](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html), from _ad-_ ("to") + _locus_ ("place").

Ever since we invented computers, there had to be an answer to the question:
"Where to put that data?".

And there are a number of options and tradeoffs to consider:
allocations have to be fast, space-efficient, and scalable; the combination is
not an easy task!

In the early days, memory was managed by hand. Humans would punch holes into
pieces of paper or flip switches on a machine to "allocate memory". When the
computer loaded a program, it would read the program's code and data from there
and print out the results or make lights blink.

As computer memory got bigger, special programs &mdash; allocators &mdash; were
written to take on the job of managing memory.

## Stack and Heap Allocations

Memory can be divided into two categories: _static_ and _dynamic memory_.

Static memory is around for the entire duration of the program's execution, and
it's allocated at compile time.
In contrast, dynamic memory is more short-lived and gets allocated at runtime.

Static memory lives in the `GLOBAL` and `CODE` sections of a program, while
dynamic memory lives on the _stack_ and the _heap_ sections.

Here's a diagram of the memory layout of a program:

{{ figure(src="memory.jpg" invert="true") }}

The `CODE` section (a.k.a. the _text segment_) contains the compiled code, which
is the set of instructions that the computer follows to execute the program. The
`GLOBAL` section (a.k.a the _data segment_), on the other hand, contains static
data, which is data that remains constant throughout the
program's execution.

These two sections are typically allocated at compile time, which means that
their size and contents are determined before the program is even started. Data
in these sections is usually read-only, which means that the program cannot
modify their contents at runtime.

The stack and the heap on the other hand are allocated at runtime and are
read-write. They "grow" and "shrink" as needed.

Before we can take a closer look at Rust, we first must understand how the stack
and the heap work.

### The Stack

{{ figure(src="stack_heap.jpg" invert="true") }}

The main purpose of the stack is to store data for the function that is currently
being executed. When a function is called, a new _stack frame_ is created for it.
The stack frame contains the function's local variables, parameters, and
return address.

You can think of the stack as a stack of plates: When you add a new plate, you
can only place it at the top. Same goes for removing: You can only remove the
topmost plate.
It's very simple, which is what makes it so effective and fast.

A CPU register is used to store the address of the topmost element of the stack,
which is known as the Stack pointer. [On Intel x86 machines, this is stored in a
dedicated CPU register called
`SP`](https://en.wikipedia.org/wiki/Stack_register).

When you add a new element, you need to increment the stack pointer.
To remove (or "pop") an element, just decrement the pointer.
Both operations can be done with just one CPU instruction.

In Rust, the stack pointer is managed automatically by the compiler and runtime.
When a program is executed, the Rust runtime sets up a stack and manages the
pointer to the top of the stack. As functions are called and variables are
allocated on, the stack pointer is adjusted to keep track of the current stack
location.

Rust's default stack size is 2MB on Unix (as defined
[here](https://github.com/rust-lang/rust/blob/7632db0e87d8adccc9a83a47795c9411b1455855/library/std/src/sys/unix/thread.rs)),
but you can change it with the `RUST_MIN_STACK` environment variable.

You cannot store arbitrarily large data on the stack and it gets cleaned up when
you leave a function. This makes it somewhat limited to things of which you know
the size of at compile-time and which have a limited scope.

### The Heap

If you need more flexibility or you just can't tell the size of an object at
compile-time (e.g. because you read data from a user-specified file),
you can allocate memory on the heap &mdash; at runtime &mdash; instead. You can
freely allocate any memory address on the heap and its size is virtually
unlimited, however it is generally slower as it might require a syscall for
allocations and you might have to reallocate memory when growing things like a
vector.

(Reallocation is a process of copying the data from one memory location to
another and freeing the old memory.)

Since you can move stuff around on the heap and there is no fixed location for
each object, the allocator needs to keep track of what memory is already
allocated.

On top of that, if you remove things, you'll end up with "holes" in-between the
elements. This is called "memory fragmentation".
As a consequence you might have to stop and reorder items to free up some space,
which can cause some overhead. The flexibility comes with a price.

A possible analogy for the heap that is similar to the stack of plates analogy
for the stack could be pile of laundry. Just like the heap is a region of memory
used for dynamic memory allocation, a pile of laundry is a collection of items
that can grow and shrink as needed. It can contain a variety of
different items, just like the heap can contain a variety of different variables
that are allocated at runtime.

And like the heap, the pile of laundry can change in size, but it may be more
difficult to manage and keep organized. In contrast, the stack of plates is more
organized and has a fixed size.

## Quick Recap of the Stack and the Heap

So there you have it!

Even though you might have been familiar with the stack and the heap before,
it's important to understand the differences between them as Rust is very strict
about it as we'll see later.

## Why Can't All Allocations Be Static?

It would be nice if we could just allocate all memory statically.
That way we could avoid the overhead of dynamic memory allocation and our programs
would be fast and efficient.

However not even Nostradamus could predict the sizes of some data structures at
compile time.
For example, consider storing a list of students but you don't know the number
of students in advance. How many entries should you allocate for the list?
Dynamic memory allocation makes it possible to defer the decision until runtime.
That's why you need the stack and the heap.

## Who Manages Dynamic Allocations?

That's the job of an allocator.

An allocator is a program that manages memory for other programs. It's a
fundamental piece of software that's been around for a long time.

Allocators are responsible for finding a place in memory for a program's data,
and keeping track of which parts of memory are in use and which are free.

Research on allocators has been going on for decades, and with the
advent of new hardware, new techniques get developed all the time.

## Excursion: What Are Some Popular Allocators?

The architecture of modern-day allocators is a ✨ fascinating topic ✨ on its own.
If you're interested in learning more, here's a little excursion for you!
If you don't feel like it, feel free to skip this section.

Here's a list of some popular allocators used in the wild and what they are used for:

- [jemalloc](https://github.com/jemalloc/jemalloc) &mdash; FreeBSD and Firefox, [Rust until 1.32.0](https://blog.rust-lang.org/2019/01/17/Rust-1.32.0.html#jemalloc-is-removed-by-default)
- [tcmalloc](https://github.com/google/tcmalloc) &mdash; Google
- [mimalloc](https://github.com/microsoft/mimalloc) &mdash; Microsoft
- [libumem](https://github.com/gburd/libumem) &mdash; Solaris

There are [many more](https://github.com/daanx/mimalloc-bench#current-allocators), but
at the time of writing, mimalloc [claims to be the fastest](https://github.com/microsoft/mimalloc#Performance);
and they also published a cool [whitepaper](https://www.microsoft.com/en-us/research/uploads/prod/2019/06/mimalloc-tr-v1.pdf).

Most modern allocators split memory into
[chunks](https://sourceware.org/glibc/wiki/MallocInternals) and, commonly, there
are separate regions for storing "small", "medium", or "large" objects. For
example, GNU's malloc, which is based on
[dlmalloc](http://gee.cs.oswego.edu/dl/html/malloc.html) and
[ptmalloc](http://www.malloc.de/en/) uses three chunk sizes ([Source:
Wikipedia](https://en.wikipedia.org/wiki/C_dynamic_memory_allocation#Implementations)):

> - For requests below 256 bytes (a "smallbin" request), a simple two power best
>   fit allocator is used. If there are no free blocks in that bin, a block from the
>   next highest bin is split in two.
> - For requests of 256 bytes or above but below the `mmap` threshold, dlmalloc
>   since v2.8.0 use an in-place bitwise trie algorithm ("treebin"). If there is no
>   free space left to satisfy the request, dlmalloc tries to increase the size of
>   the heap, usually via the `brk` system call.
> - For requests above the mmap threshold (a "largebin" request), the memory is
>   always allocated using the `mmap` system call. The threshold is usually 256 KB.
>   The mmap method averts problems with huge buffers trapping a small allocation at
>   the end after their expiration, but always allocates an entire page of memory,
>   which on many architectures is 4096 bytes in size.

That's a quick overview of some popular allocators, but we are mostly interested
in **memory handling for Rust programs** today, so let's move on. There are some
great resources on modern, general-purpose allocators if you want to dig deeper
into allocators in general:

- [Details on popular allocators on Wikipedia](https://en.wikipedia.org/wiki/C_dynamic_memory_allocation#Implementations)
  for some more details.
- [Overview of Malloc](https://sourceware.org/glibc/wiki/MallocInternals) about GNU C library's (glibc's) malloc implementation.
- [A look at how malloc works on the Mac](https://www.cocoawithlove.com/2010/05/look-at-how-malloc-works-on-mac.html).

## Recap

Alright, I think we've talked enough about the stack and the heap for now! You
can find even more info as well as the respective syscalls
[here](https://www.linuxjournal.com/article/6390) and
[here](http://web.mit.edu/rust-lang_v1.25/arch/amd64_ubuntu1404/share/doc/rust/html/book/first-edition/the-stack-and-the-heap.html#the-heap).

With that we're well prepared to dive into the Rust memory model!

## Memory Management in Rust

Okay so programs need memory to store data and _someone_ has to manage it, right?
In Python, PHP, Go, and Java it's the [garbage
collector](<https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)>)'s
job: it's the counterpart to the allocator and it's like the janitor of your program.

From time to time it iterates over all the process memory on the heap and cleans
up whatever isn't needed anymore. That's pretty handy for the most part, because
you don't have to worry about memory management at all!

The downside is that the garbage collector blocks the main thread and prevents your
program from doing any meaningful work. To avoid that, most modern GCs are a piece of
art and highly optimized. For example, did you know that the Golang garbage
collector [only blocks for a few hundred **micro**seconds on
average](https://go.dev/blog/ismmkeynote)? In 99% of all cases, that's more than
good enough.

...but what about the _remaining_ 1%? 😉

Wellll, that's when you want to squeeze out every little bit of performance from
your system... or when you simply don't have a way to run a garbage collector &mdash;
like on an [embedded system](https://stackoverflow.com/a/1726006/270334).

(For some context: An embedded system is a computer that doesn't _look_ like a computer. It's a
computer that's built into a device, like a car, a washing machine, or a
smartphone. These devices are often very resource-constrained, so you can't
just run a garbage collector on them.)

You might know that Rust has no built-in garbage collector.
Instead, it uses a principle called [RAII](https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization) (Resource acquisition is initialization)
or OBRM (Ownership-based resource management)
to automatically allocate and free memory by checking the _liveliness_ of objects at compile-time.
That's a fancy way of saying "whoever allocated memory has to free it again" and
the Rust compiler knows who owns memory by keeping track of [ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html).

It's pretty simple and effective: When the owner goes out of scope, owned memory
gets dropped:

```rust
fn main() {
    // Let's allocate some memory within a scope...
    {
        // Stack allocation
        let static_int = 1;

        // Heap allocation
        let dynamic_vec = vec![1, 2, 3];
    }

    // Memory no longer reachable!
    println!("{static_int}"); // Error: cannot find value `static_int` in this scope
    println!("{dynamic_vec:?}"); // Error: cannot find value `dynamic_vec` in this scope
}
```

What's _brilliant_ about this is that the compiler can check at **compile-time**
if ownership is correctly managed. There is never a situation where it's not
clear whether a variable is still in use or not.

In my personal opinion this is Rust's main innovation:
It took the RAII principle from C++ and made it a compiler feature!
Programs simply won't compile if memory is not correctly managed.

Further Reading:
Rustonomicon - The Perils Of Ownership Based Resource Management (OBRM)
https://doc.rust-lang.org/nomicon/obrm.html

## Deciding Where To Allocate: The `Sized` Trait

In Rust, anything can be put on the heap. However, if a type implements
[`Sized`](https://doc.rust-lang.org/std/marker/trait.Sized.html), it can also be
put on the stack. `Sized` is a marker trait that indicates that the type's size
is known at compile time. The trait has no methods and is automatically
implemented for all types whose size is known at compile time like `i32`,
`bool`, `char`, etc. Putting things on the stack is faster than putting them on
the heap because the stack is closer to the CPU.

(Compare that to a language like Java where everything is an object and thus
allocated on the heap unless you use a [primitive
type](https://en.wikibooks.org/wiki/Java_Programming/Primitive_Types) like `int`
or `char`. The programmer has less control over where the data is stored.)

## How Can I Spot an Allocation?

In the above example, we allocated memory on the stack and on the heap.
How can we tell which is which?

There is no canonical way to do this, but there are some rules of thumb:

- **Is the type a data structure from `std`, like `String`, `Vec`, `BTreeMap` or `HashSet`?**
  If yes, then it's a heap allocation.
- **Does my type contain a `Box` or an `Rc` or an `Arc`?**
  If yes, then there’s a heap allocation.

A really quick and dirty way to find heap allocations is by running
[ripgrep](https://github.com/BurntSushi/ripgrep) in your project folder:

```bash
rg -e 'String::new' \
   -e 'to_string()' \
   -e 'to_owned()' \
   -e 'Vec::new' \
   -e 'vec!' \
   -e 'BTreeMap::new' \
   -e 'HashMap::new' \
   -e 'HashSet::new' \
   -e 'Box::new' \
   -e 'Rc::new' \
   -e 'Arc::new' \
   -e 'read_to_string'
```

On top of that, crates that you use could also allocate, so you have to inspect
that code as well.

## How Do Allocations Work In Rust?

As seen above, there are data structures that implicitly allocate memory on the
heap.

More complex data structures use less complex data structures under the hood
and add more guarantees on top of them.

Take a `String` for example. It's a wrapper around a `Vec<u8>` that adds
the guarantee that it always holds a valid UTF-8 string.

```rust
struct String {
    vec: Vec<u8>,
}
```

(The type definition can be found [here](https://doc.rust-lang.org/src/alloc/string.rs.html#368).)

The [`Vec`](https://doc.rust-lang.org/src/alloc/vec/mod.rs.html#400) type in turn is a wrapper around a `Box<[T]>` that provides a bunch of methods
to manipulate vectors.

```rust
pub struct Vec<T, A: Allocator = Global> {
    buf: RawVec<T, A>,
    len: usize,
}
```

whereas `RawVec` is a wrapper around a `Box<[T]>`:

```rust
pub struct RawVec<T, A: Allocator = Global> {
    ptr: Unique<T>,
    cap: usize,
    alloc: A,
}
```

You can see how complex data structures are built up from simpler data types
with less guarantees.

<details>
<summary>
💡 Quiz: How big is an empty `String` in Rust?
Take a moment to do the math.
</summary>

It depends on the architecture of your system.
<bold>It's 24 bytes on 64-bit systems</bold>.

Why is that?

<ul>
<li>String = Vec&lt;u8&gt;</li>
<li>Vec = buf + len</li>
<li>buf = ptr + cap</li>
<li>ptr = usize which is 64 bits on 64-bit systems, so 8 bytes</li>
<li>cap = usize, so 8 bytes</li>
<li>len = usize, so 8 bytes</li>
</ul>

```rust
fn main() {
    let empty = String::new();
    println!("size of empty: {}", std::mem::size_of_val(&empty));
    // prints: size of empty: 24
}
```

</details>

At the end, all types are composed of primitive types like `u8`, `i32`, `bool`,
`char`, etc. The compiler knows how to allocate memory for these types
and by extension for all other types.

The following video goes into more detail about how the Rust runtime manages memory:

{{ video(url="https://www.youtube.com/embed/rDoqT-a6UFg", preview="yt_visualizing_memory.jpg") }}

## How Do I Prevent Allocations?

There are two ways to prevent allocations:

- Use data structures that don't allocate
- Reuse existing allocations

In this context, you will often hear the term "zero copy" or "zero allocation".
It means that you don't allocate additional memory to perform a task.

Let's look at these two approaches in more detail.

### Use Data Structures That Don't Allocate

The most obvious way to prevent allocations is to use a data structure that
doesn't allocate.

For example, if you want to represent a "list" of strings, you can use a
`Vec<&str>` instead of a `Vec<String>`. You can even use a `&[&str]` slice
instead of a `Vec<&str>` to avoid heap allocations altogether.
The downside is that you can't add or remove elements from the list.
If that's not a problem, then this is a great way to avoid allocations.

Zero copy is a lot of fun! Especially for representing datastructures.

The basic idea is that you stick to `&` references (or borrows) for all your
data. With zero-copy parsing, you store `&[u8]` or `&str` slice references to
the original data instead of copying it into a new buffer and thus allocating
memory.

Here's an example from the `serde` crate:

```rust
#[derive(Deserialize)]
struct User<'a> {
    id: u32,
    name: &'a str,
    screen_name: &'a str,
    location: &'a str,
}
```

> Zero-copy deserialization means deserializing into a data structure, like the
> User struct above, that **borrows string or byte array data from the string or
> byte array holding the input**. This avoids allocating memory to store a string
> for each individual field and then copying string data out of the input over to
> the newly allocated field. Rust guarantees that the input data outlives the
> period during which the output data structure is in scope, meaning it is
> impossible to have dangling pointer errors as a result of losing the input data
> while the output data structure still refers to it.

Source: https://serde.rs/lifetimes.html

Another example is `nom`, a zero-copy parser combinator library for Rust.
Let's say we want to parse a struct from the following text without allocating:

```json
id: 123,
name: "John Doe",
hobbies: ["programming", "reading", "writing"]
```

With `nom` we can do this:

```rust
#[derive(Debug, PartialEq)]
struct User<'a> {
    id: u32,
    name: &'a str,
    hobbies: Vec<&'a str>,
}

named!(parse_user<&str, User>,
    do_parse!(
        tag!("id: ") >>
        id: map_res!(digit, str::parse) >>
        tag!(", name: ") >>
        name: delimited!(tag!("\""), is_not!("\""), tag!("\"")) >>
        tag!(", hobbies: ") >>
        hobbies: delimited!(tag!("["), separated_list!(tag!(","), delimited!(tag!("\""), is_not!("\""), tag!("\""))), tag!("]")) >>
    )
);
```

Here's a video that explains how zero-copy parsing works in Rust
by looking at the `nom` crate:

{{ video(url="https://www.youtube.com/embed/8mA5ZwWB3M0", preview="yt_nom.jpg") }}

Consider the following example:

```rust
fn main() {
    let data = "Hello, world!";

    let hello = &data[0..5];
    let world = &data[7..12];

    println!("{} {}", hello, world);
}
```

This program prints `Hello world` and doesn't allocate any memory.
The `hello` and `world` variables are just references to the original data and we
learned that constant strings are stored in the binary inside the `DATA` segment.

Is that true?

Let's check the binary!

```bash
> cargo build
> strings target/debug/zero-copy | grep Hello
/rustc/897e37553bba8b42751c67658967889d11ecd120/library/core/src/fmt/mod.rsHello, world!src/main.rs
```

So, the string is stored in the binary and we can use it without allocating
any memory.

### Reuse Existing Allocations

What if you need to allocate memory but you want to limit the number of
allocations?
In this case you can reuse existing allocations.

#### Trick 1: Allocate The Right Amount Of Memory Up Front

The first trick is to use methods like `with_capacity`
if you already know how much memory you'll need.

For example, if you need to concatenate a lot of small strings, you can create a
`String::with_capacity` to allocate enough memory for all the pieces of the
string. Then you can use `push_str` to add the strings to the `String` without
allocating any additional memory:

```rust
fn main() {
    let mut s = String::with_capacity(100);

    s.push_str("Hello, ");
    s.push_str("world!");

    println!("{}", s);
}
```

`with_capacity` also exists for `Vec`, `HashMap`, `BufWriter`, `PathBuf`, etc.

#### Trick 2: Cache Values To Avoid Allocations

If you find that you repeatedly allocate the same value, you can cache it to
avoid allocating it multiple times.

For example, if you need to allocate a `String` that contains the same text
multiple times, you can cache it in a `static` variable:

```rust
static HELLO_WORLD: &str = "Hello, world!";
```

This way, you only allocate the string once and then you can reuse it multiple
times.
If you can't do this because the string is dynamic, you can use a [`lazy_static`](https://github.com/rust-lang-nursery/lazy-static.rs) or [`once_cell`](https://github.com/matklad/once_cell)
to cache the value:

```rust
lazy_static! {
    static ref USER_AGENT: String = {
        let mut s = String::new();
        s.push_str("MyApp/");
        // Add crate version
        s.push_str(env!("CARGO_PKG_VERSION"));
        s
    };
}
```

If you need to handle a lot of strings at runtime and you don't know which ones
but there are a lot of duplicates, you can use a string interner to cache the
strings and avoid allocating them multiple times.

As Alex Kladov (matklad, the author of the `once_cell` crate and Rust Analyzer) [explains](https://matklad.github.io/2020/03/22/fast-simple-rust-interner.html):

> Interning works by ensuring that there’s only one canonical copy of each
> distinct string in memory. [...] If all strings are canonicalized, comparison
> can be done in O(1) (instead of O(n)) by using pointer equality.

There are many string interner crates available for Rust, including [ustr](https://github.com/anderslanglands/ustr).

This strategy is also useful for other types of data. In the easiest case, you
can use a `HashMap` to cache values:

```rust
let mut cache = HashMap::new();

let value = cache.entry(key).or_insert_with(|| {
    // Compute value here, then return it.
    value
});

// Use value
// ...
```

If you need to cache a lot of values, you can use a
[`lru_cache`](https://docs.rs/lru-cache) to limit the number of values that are
cached.

#### Trick 3: Use A Memory Pool To Reuse Allocations

If you need to allocate a lot of objects of the same type, you can use a memory
pool to reuse the allocations.
The concept is closely related to "Region-Based Memory Management".
(Source: https://en.wikipedia.org/wiki/Memory_pool)

Simply put, it's a chunk of memory that you can use to allocate objects of the
same type. When you're done with the objects, you can clear the entire pool to reuse
the memory. This is much faster than allocating and freeing memory individually.

A popular crate for this is [`bumpalo`](https://github.com/fitzgen/bumpalo),
a "bump allocator" that allocates memory in a pool.
Here's an example of how to use it with a bunch of objects of the same `struct` type:

```rust
use bumpalo::Bump;

enum Fur {
    White,
    Black,
    Colorful,
}

struct Kitty {
    name: String,
    age: u8,
    fur: Fur,
}

fn main() {
    // Create a new arena to bump allocate into.
    let bump = Bump::new();

    // Allocate values into the arena.
    let oskar = bump.alloc(Kitty {
        name: "Oskar".to_string(),
        age: 1,
        fur: Fur::White,
    });

    let flecki = bump.alloc(Kitty {
        name: "Flecki".to_string(),
        age: 10,
        fur: Fur::Colorful,
    });


    // Use the allocated values.
    println!("{} is {} years old", oskar.name, oskar.age);
    println!("{} is {} years old", flecki.name, flecki.age);

    // The arena is dropped at the end of the scope (e.g. function), freeing all
    // the allocated values.
}
```

Bumpalo also has a `Vec` type that you can use to allocate a bunch of values of
the same type:

```rust
use bumpalo::{collections::Vec, Bump};

// ...

fn main() {
    // Create a new arena to bump allocate into.
    let bump = Bump::new();

    // Allocate values into the arena.
    let mut kitties = Vec::new_in(&bump);
    kitties.push(Kitty {
        name: "Oskar".to_string(),
        age: 1,
        fur: Fur::White,
    });
    kitties.push(Kitty {
        name: "Flecki".to_string(),
        age: 10,
        fur: Fur::Colorful,
    });

    // Use the allocated values.
    for kitty in kitties {
        println!("{} is {} years old", kitty.name, kitty.age);
    }
}
```

## The Journey Of A Rust Allocation

TODO

rust code -> new -> malloc -> brk/mmap

[Diagram] jemalloc System allocator the allocator might call brk or mmap, which
might be slow mmap asks the kernel to gives us some new virtual address space,
basically a new memory segment. brk is used to change the size of an already
existing memory segment.

`man mmap man brk`
{{ video(url="https://www.youtube.com/watch?v=HPDBOhiKaD8", preview="yt_malloc.jpg") }}

These syscall might cause a lot of overhead -- e.g. when we don't have enough
RAM and the system starts swapping.

strace brk calls allocations
https://ysantos.com/blog/malloc-in-rust

"Now so far we have only looked at memory allocation on the OS level, through
system calls. But many programming languages don’t allocate memory by directly
invoking brk or mmap. In Linux they usually delegate this job to libc."

## How Are Rust Allocators Implemented?

You just have to implement `alloc` and `dealloc` like this:

```rust
use std::alloc::{GlobalAlloc, System, Layout};

struct MyAllocator;

unsafe impl GlobalAlloc for MyAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        System.alloc(layout)
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        System.dealloc(ptr, layout)
    }
}

#[global_allocator]
static GLOBAL: MyAllocator = MyAllocator;

fn main() {
    // This `Vec` will allocate memory through `GLOBAL` above
    let mut v = Vec::new();
    v.push(1);
}
```

https://doc.rust-lang.org/std/alloc/index.html

As we've learned, the creation of a variable on the stack (aka local variable)
just means to shift the stack pointer by the size of that variable.
And static variables (aka global variables) have their space reserved in the static
data memory segment from the very beginning of the process execution. You simply
know the address where the variable resides.

But dynamic allocation is done on-demand. The dynamic memory segment of the
process (aka heap) is managed by a dynamic allocator: that’s code which, given
required size of the data, needs to find an unused chunk of the memory of at
least the required size, update its own records of what chunks it had provided
and pass the address to you (the caller). Upon release of the memory chunk (aka
free), the allocator needs to update its records again and at times, consolidate
the chunks so that the heap fragmentation doesn’t get out of hand. And all that
needs to be thread-safe.

These operations are clearly a lot more complex than the previous cases; and
that’s the reason why dynamic allocation is “expensive”. Creating a good, fast
dynamic allocator is a problem with capital P—not an easy one to solve.

From https://www.quora.com/Why-is-heap-allocation-slow

## When Does Rust Allocate?

when the size of an element is not known at compile time - dynamic vs static
datatypes basically every time you call `new` it's allocating on the heap

## Are Heap Allocations Really Slower?

Benchmark diagram from
https://publicwork.wordpress.com/2019/06/27/stack-allocation-vs-heap-allocation-performance-benchmark/

The right answer is: stack is catastrophically faster than heap! Here’s why:

When you allocate a new memory block on the heap (with malloc/calloc/realloc or
new in C/C++), here is what really happens:

The OS kernel is asked whether it actually has that space available (yep: you
have to ask the OS, a huge expense!!)…. for all programs it runs at that moment.
Why? Because you can easily ask for a block of 32Gigs (in a 64bit OS) even if
your machine only has 8Gigs of physical RAM! If the answer is yes, then the OS
needs to reserve that block in the RAM for you… but that may take a very long
time if your machine is heavily loaded, as it may involve virtual memory — in
which case The OS must go over all the RAM used by all the programs it runs at
that moment, and decide that some of it may be reasonably removed from the RAM
to make place for what you’re asking for… and put it on the disk(!) instead
Needless to say, it must then physically write it on the disk in order not to
lose the contents of it, before it can return you that freed RAM block With the
resulting memory block to be given to you, there’s still much to do, as the OS
must Possibly (and quite often, actually!) reorganize the pieces of free space
to “coagulate” them into a contiguous block not smaller than the size you’re
asking for Reserve that block for you, which means marking it in use Conversely,
when you free a block allocated on the heap (with free/delete/delete[] in
C/C++), it must mark that block as being again available for reuse If your
program is heavily multi-threaded (as are mine), then spare for the typically
tiny TLS (Thread Local Storage), allocating on the heap must be atomic (because
there’s just one RAM, whatever number of threads you may be running), which
means putting all other threads that may want to allocate at the same time on
hold until all the jazz above is done.

And now you compare all of the above huge stuff with a single thing: just
incrementing the stack pointer!!!!

How come? Simple: the stack is allocated at the start of the run of your
program. There is no call to a memory manager that would call the heap allocator
— the stack pointer (a super-fast CPU register!) is simply incremented, in a
single CPU cycle.

Ah… and what if you run out of that stack space? Simple: your program will
“simply” crash with stack overflow — that’s why you should never use large
arrays as local variables (which are all put on the stack): they may well cause
a stack overflow.

Stack is very slightly riskier (only if you’re not careful!)… but is
catastrophically faster than the heap.

https://www.quora.com/Which-is-faster-stack-allocation-or-heap-allocation/answer/Emanuel-Falkenauer

zero copy serialization. can be extremely fast
https://davidkoloski.me/blog/rkyv-is-faster-than/

## Should I Care?

If you're asking, then probably not.

Heap allocations are quite normal and nothing bad. If you're coming from a
dynamically typed language like Python, Ruby, or JavaScript, everything is heap
allocated (Boxed, as Rustaceans say) unless you're working with C-extensions
like numpy. Allocations are quite useful in these languages as you don't have to
manually allocate and deallocate memory yourself.

Furthermore, not all Rust programs are bottlenecked on allocations.

## When Can Allocations Be Bad?

- embedded (writing a gameboy game) - high-perf code - gaming - hard realtime
  code (predicatable performance) like low-latency audio allocations can slow down
  the system or downright fail at runtime That is, panic on failure
  https://news.ycombinator.com/item?id=15484323

In some situations you don't even have an allocator to begin with. Airplane no
allocations while in-flight because malloc can fail

So unless you're in a hot loop, you probably won't notice the difference But
maybe you're just curious

If you use dynamic memory alloc, you're dependend on the state of the system:
memory fragementation (if you need one block of memory), garbage collection,...
Not using allocs can make your code more predicatable. The important thing you
gain is determinism. Malloc can become slow under memory pressure. Calling
malloc can fail, leading to an out of memory condition. Avoiding allocation
reduces the set of scenarios where you can encounter performance degradation.

Thanks to Rust's ownership model, _views_ (references) into memory are entirely
safe. So you can fearlessly refactor and the compiler will tell you if your code
will work safely at runtime. In other languages like C++, using pointers is
inherently unsafe and can lead to catastrophic errors if you don't pay very
close attention. This makes performance optimizations way more fun! See also
https://brson.github.io/rust-anthology/1/where-rust-really-shines.html

## How To Measure Allocations?

Before you jump right in and try to avoid all allocations, is crucial to not get trapped by
premature optimization.

If you don't really have a problem and you don't _need_ to change anything.
Allocations usually low-overhead.
Alternatively change your allocator. That could already make the biggest
difference.

Modern, fast, multi-threaded malloc implementations like jemalloc actually use
multiple heaps (arenas) to make allocations faster.

See this talk by one of the Jemalloc authors:
https://www.youtube.com/watch?v=RcWp5vwGlYU

Or this technical write-up on tcmalloc
https://github.com/google/tcmalloc/blob/master/docs/overview.md

measured/profiled the performance of whatever you are trying to do and
discovered that your use of normal vectors is some kind of bottleneck.

And for that, you should measure the allocs I would recommend to start by
profiling your program on some realistic workloads and see if any significant
time is spent on memory allocation. Maybe you have a bigger bottleneck
elsewhere.

cargo instruments on macOS [ Screenshot ]

heaptrack on Linux
https://gist.github.com/HenningTimm/ab1e5c05867e9c528b38599693d70b35 You can
also use Valgrind's Massif, but it's usually slower
https://www.valgrind.org/docs/manual/ms-manual.html

Linux? Windows?

[More tools in the Rust Performance
Book](https://nnethercote.github.io/perf-book/profiling.html)

## Benchmarks

Avoiding allocations won't help you improve compile-time performance -- only
runtime performance. If you like to improve compile time perf, look into
https://endler.dev/2020/rust-compile-times/ hyperfine criterion

## Quick Wins

Allocations are rarely the bottleneck. Use a faster allocator
https://github.com/gnzlbg/jemallocator https://github.com/microsoft/mimalloc
https://github.com/mjansson/rpmalloc/tree/master
https://github.com/EmbarkStudios/rpmalloc-rs Measure again

Instructions on tcmalloc https://github.com/jmcomets/tcmalloc-rs

mimalloc by Microsoft https://github.com/purpleprotocol/mimalloc_rust

## How To Reduce Allocations

If you reached this point, you're either curios, or you have a real allocation problem.
The easiest way to avoid allocations is to get rid of your code. It sounds obvious, but removing code-paths by cleaning up your codebase is the easiest way to save up on allocations.

## Built-in methods in the standard library

common datastructures (a.k.a [collections](https://docs.rust-embedded.org/book/collections/)): String, Vec, HashMap, PathBuf vs &str, slice, Path

Rust container types visualization
https://docs.google.com/presentation/d/1q-c7UAyrUlM-eZyTo1pd8SZ0qwA_wYxmPZVOQkoDmH4/edit#slide=id.p

Use Vec::with_capacity if you know the size of your data beforehand instead of Vec::new().
For example if you need to store one value per row in a vector, you could say

```rust
Vec::with_capacity(rows.len());
```

> Lessons from high-performance / embedded development: If you know the size of your data beforehand, or can at least put a bound on it, it's best to pre-allocate your memory and then hand out bits as needed through a custom allocator working on the pre-allocated set. That way you have only a single allocation and all your data is contiguous in memory (huge deal for cache coherency and therefore speed of access). Very easy to put a vector/ArrayList -type interface on top of this.

more rarely Box, Rc, Arc

Avoid `clone` `to_owned()` `to_string()` `to_vec()` PathBuf::from into() for
vec: `iter().cloned().collect()`

Use Path instead of PathBuf

`???`

str instead of String

````struct Entry { name: Option<String>, phone: Option<String>, address:
Option<String>, } ```

Each non-empty String is another separate allocation. In the case of the strings
that come from the input, they are just copied from there. In theory one could
borrow from the input data and do something like this:

``` struct Entry<'a> { name: Option<&'a str>, ... } ```

Then it could just point into the input data instead of allocating and copying.
But that would make working with the structures and the whole API more hairy.

### Vec

Whenever you create a new vector, the default size is 4 elements.

```rust fn main() { let mut v = Vec::new(); for i in 0..=64 { v.push(i);
println!("{}", v.capacity()); } } ```

``` 4 4 4 4 8 8 8 8 16 ... 16 32 ... 32 64 ...
64 128 ```

Its size gets doubled whenever it can't hold an additional element. Therefore
you should first try to preallocate your vectors, i.e. use with_capacity()
instead of new(). I've found it to be a big perf saver in alloc-intensive
workloads.

slices instead of vec example: extractor going from vec to slice for extracting
links. zero copy means "view into memory"


this will require a basic understanding of lifetimes and borrowing Oftentimes
the added complexity is not worth it. Example:
https://github.com/squili/serenity-slash-decode/pull/2 basically "views into
existing memory" with certain lifetime guarantees instead of allocating new
objects.

## Errors

Sometimes I see functions with a signature like this:
```
fn foo() -> Result<(), Box<dyn Error>>
```

It tells the compiler that this function will return a result where the error
implements the `Error` trait, but not much else. (This is called a trait
object.) That's all fine and dandy, but since the compiler does not know the
size of `Error` at compile-time, it requires an allocation at runtime. For
bigger applications, it makes sense to replace this with an own Error type that
can be checked statically.

Libraries commonly use [this-error](https://github.com/dtolnay/thiserror) while
binaries use [anyhow](https://github.com/dtolnay/anyhow). Both of them avoid
heap allocation for errors where possible.

##  Cow<String>

todo

## Using Clippy to find redundant allocations

clippy has lints to avoid allocations
https://rust-lang.github.io/rust-clippy/master/ Finds redundant allocations

``` use std::boxed::Box;

pub fn foo(bar: Box<&usize>) { println!("{}", bar); } ```

running ``` cargo +nightly clippy                           ✘ ``` results in

``` | 3 | pub fn foo(bar: Box<&usize>) { |                 ^^^^^^^^^^^ help:
try: `&usize` | = note: `#[warn(clippy::redundant_allocation)]` on by default =
note: `&usize` is already a pointer, `Box<&usize>` allocates a pointer on the
heap = help: for further information visit
https://rust-lang.github.io/rust-clippy/master/index.html#redundant_allocation
````

Pretty cool, huh?

BytesMut vs &mut [u8]

If you only ever need an immutable view into a byte buffer, you probably want to
use `&mut [u8]`. If however you need to split up that buffer (e.g. while
parsing) then BytesMut is really helpful. It's like a view into an
`Arc<Vec<u8>>` with the guarantee that you have explicit access to a slice
inside that buffer.

## Third-Party Crates

Generally I would gravitate towards using built-in Rust data structures unless
you have a pretty good reason not to.

- Tendril

- tinystring

You really want a copy-on-write string, an immutable string, a rope, a reference-counted string, or an always-in-place string. Or some combination of the above depending on the circumstance.

fixed capacity collections:

- https://github.com/japaric/heapless

- https://github.com/thomcc/arcstr

Stack-allocated trait objects

- https://github.com/mahkoh/trait-union

## Vec Replacements

You have many Vecs that are “very small” (both in number of items and in size_of
of the item type) try replacing them with arrays (if the size is always the same
and known at compile-time), arrayvec (if the size fits in a hard upper bound
known at compile-time), or tinyvec / smallvec (if the length is usually smaller
than some value decided at compile-time, but can rarely grow larger. Especially
when you need to allocate buffer spaces that is mostly predictable (but not
completely, otherwise you'd use an array) in a tight loop. ).

Careful with smallvec as it can actually _decrease_ performance. It introduces
branching on each array access, since we need to determine whether we use an
internal or external buffer. Processors hate branching.

https://www.reddit.com/r/rust/comments/n2429h/arrayvec_vs_smallvec_vs_tinyvec/

https://www.reddit.com/r/rust/comments/p0hmvz/a_question_about_allocationsallocators/h870rzo/:

If your program is structured such that many vectors are allocated around the
same time (e.g. for a specific operation like parsing some input) and later
freed around the same time, using an arena allocator library can help (at the
cost of delaying when memory is actually freed for other stuff).
https://manishearth.github.io/blog/2021/03/15/arenas-in-rust/ has many details
on how that works.

- https://github.com/slightlyoutofphase/staticvec

bump allocator bumpalo or
[scoped_arena](https://github.com/zakarumych/scoped-arena)

https://github.com/sebastiencs/shared-arena

helpful with frequent, small allocations with short lifespans

## How To Deny Allocations Altogether

- cargo plugins to fail on allocs

- Use only the core library #![no_std]
  https://stackoverflow.com/a/51934186/270334 `no_std` Bryan Cantrill calls it the
  killer feature of Rust. > Rust has the unique ability to **not** depend on its
  own standard library https://youtu.be/cuvp-e4ztC0?t=1079 Cannot perform heap
  allocation. Notably, it's enforced **at compile time**.

- https://github.com/Windfisch/rust-assert-no-alloc

  ```rust
  assert_no_alloc(|| {
      println!("Alloc is forbidden. Let's allocate some memory...");
      let mut vec_cannot_push = Vec::new();
      vec_cannot_push.push(42); // panics
    });
  ```

String interning https://github.com/servo/string-cache

## Real world articles / further reading

- [A Journey in Optimizing
- `toml_edit`](https://epage.github.io/blog/2021/09/optimizing-toml-edit/)
- [Making slow Rust code
- fast](https://patrickfreed.github.io/rust/2021/10/15/making-slow-rust-code-fast.html)

## Can I limit the amount of memory used by my program?

- https://github.com/alecmocatta/cap
- https://github.com/nnethercote/dhat-rs
"This code should do exactly 96 heap allocations".
"The peak heap usage of this code should be less than 10 MiB".
"This code should free all heap allocations before finishing".

## How Can I Find Out When My Program Allocates Memory?

### Profiling Apps

On Linux
https://apps.kde.org/massif-visualizer/
Tutorial: https://gist.github.com/KodrAus/97c92c07a90b1fdd6853654357fd557a

On macOS
https://github.com/cmyr/cargo-instruments

Heap memory usage estimation (`data_size(&example)` prints an estimate of the number of bytes used by `example` on the heap):
https://github.com/CasperLabs/datasize-rs

### Logging allocations

https://github.com/Geal/tracing_allocator
https://github.com/tobz/tracking-allocator

### Something fun

A Rust allocator which makes sound when active, like a Geiger counter.
https://github.com/cuviper/alloc_geiger

## When Does Memory Get Freed?

When a value goes out of scope

## What is the Rust standard allocator

As of Rust 2018 it's the system allocator by default.
On Linux it is
On Windows
and on macos

Before that it used to be jemalloc, but that...

## Which one is the fastest alternative to the default allocator?

It depends on your use-case

general purpose
jemmalloc

special-purpose
wee-alloc https://github.com/rustwasm/wee_alloc
lol_alloc https://github.com/Craig-Macomber/lol_alloc (for wasm)
bumpalo

is there a tool to benchmark perf with different allocs?

cargo alloc-bench?

## Does Rust Have Fallible Allocations?

Sort of.
try_reserve() and try_reserve_exact() methods on Vec, VecDeque, HashMap, HashSet, and String. These methods enable best-effort graceful handling of out of memory errors, especially large allocations on operating systems without virtual memory overcommit, or when using custom allocators that self-impose memory usage limits (like cap).
https://github.com/rust-lang/rust/issues/48043#issuecomment-898040475

The general RFC for fallible allocations is not stabilized yet:
https://github.com/rust-lang/rust/issues/48043

You can try to reserve space for a vector now:
https://doc.rust-lang.org/std/vec/struct.Vec.html#method.try_reserve
(added it Rust 1.57)
This will retrun a `Result<(), TryReserveError>`, which you can handle.

There is
https://docs.rs/fallible_collections/latest/fallible_collections/
which you can use today.

```rust
use fallible_collections::FallibleVec;

fn main() {
	// this crate an Ordinary Vec<Vec<u8>> but return an error on allocation failure
	let a: Vec<Vec<u8>> = try_vec![try_vec![42; 10].unwrap(); 100].unwrap();
	let b: Vec<Vec<u8>> = vec![vec![42; 10]; 100];
	assert_eq!(a, b);
	assert_eq!(a.try_clone().unwrap(), a);
	...
}
```

In nightly there is a new [set_alloc_error_hook](https://doc.rust-lang.org/std/alloc/fn.set_alloc_error_hook.html) function that you can use to specify a function to call when an allocation fails.

## Where Is The Code For Allocators In Rust?

https://github.com/rust-lang/rust/tree/master/library/alloc

## What Is A Memory Leak And Can It Happen In Rust?

A memory leak is when a program allocates memory but never frees it.

## Can I "see" memory allocations in Rust?

You can look at the MIR (medium intermediate representation)
https://play.rust-lang.org/?version=nightly&mode=debug&edition=2021&gist=27235b1815171c24c6da8d1e7dc04e8f

```rust
fn main() {
    let x = vec![1,2,3];
}
```

Mir:
it's a lot of code
there are calls like

```
_6 = alloc::alloc::exchange_malloc(move _4, move _5)
```

and

```
drop(_1) -> bb3;
```

in there

<sup id="fn1">1. Side note: I'm very interested in the origins of computer terms. <a href="https://endler.dev/2020/folklore/">Here's a longer list</a><a href="#ref1" title="Jump back to footnote 1 in the text.">↩</a></sup>

```

## How is Zero-Copy Related to Lifetimes?

https://users.rust-lang.org/t/how-does-zero-copy-deserialization-work/72782
which links to
https://serde.rs/lifetimes.html
Decrusting the serde crate also mentions the lifetimes on Deserializer:
https://www.youtube.com/watch?v=BI_bHCGRgMY


Other crates:

- thingbuf is a lock-free array-based concurrent ring buffer that allows access
  to slots in the buffer by reference. It's also asynchronous and blocking bounded
  MPSC channels implemented using the ring buffer.
  https://github.com/hawkw/thingbuf

- The regex crate uses a wonderful library called thread_local-rs written by
  /u/Amanieu for really fast thread safe access to a pool of previously
  initialized values. The key is that it allows for dynamic per-object thread
  local values as opposed to statically known thread locals like with the
  thread_local! macro. https://github.com/Amanieu/thread_local-rs
  https://github.com/frankmcsherry/recycler

- databake: https://github.com/kupiakos/icu4x/tree/main/utils/databake
  and basically everyting else in https://github.com/kupiakos/icu4x/tree/main/utils

## Further Reading

- Manish Goregaokar's blog post on zero-copy deserialization
https://manishearth.github.io/blog/2022/08/03/zero-copy-1-not-a-yoking-matter/

- Comprehensive Rust: Memory Management
https://google.github.io/comprehensive-rust/memory-management.html

- The Rustonomicon - Chapter on Uninitialized Memory
https://doc.rust-lang.org/nomicon/uninitialized.html

```
