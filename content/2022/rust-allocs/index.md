+++
title="Allocations in Rust"
date=2022-11-04
draft=true

[taxonomies]
tags=["rust"]

[extra]
subtitle="And How To Avoid Them"
+++

One of the main benefits of Rust is that it offers control over low-level
concepts like memory management. I always thought one of the neatest things
about Rust was that I could take _full control over memory_ and deep-dive into
optimizations at will.

I've heard people fondly speak of _zero-copy_ and _allocation-free_ code.
Alas, I wondered, what does that even mean?

Information on the topic is surprisingly sparse, and I had to piece together
whatever I could find from various sources to understand how Rust _really_
handles allocations &mdash; and how to avoid them if needed.  
To save others the trouble, I decided to write down all I've learned so far.

## Who Is This Article For?

Everyone who wants to know more about <u>allocations</u> and <u>Rust</u>, really.

Memory management internals are an intermediate topic, but you don't need to know
a lot about allocations to be productive in Rust. It can be fun and educational
to learn more, however!

The article is rather long, so feel free to jump around in
the...

## Table Of Contents

## What's An Allocation?

The word comes from _Vulgar Latin_ [_allocare_](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html), from _ad-_ ("to") + _locus_ ("place")

Ever since the first computers, programmers needed to find an answer to the question
"Where to put that data?".

And there are a number of options and tradeoffs to consider:
allocation has to be fast, space-efficient, and scalable; it's not an easy task!

In the early days, memory was managed by hand. As computer memory got bigger,
special programs &mdash; allocators &mdash; were written to take on the job.

## What is an Allocator?

An allocator is a program that manages memory for other programs. It's a
fundamental piece of software that's been around for a long time.

Allocators are responsible for finding a place in memory for a program's data,
and keeping track of which parts of memory are in use and which are free.

Research on allocators has been going on for decades, and with the
advent of new hardware, new techniques get developed all the time.

Here's a list of some popular allocators used in the wild and who uses them:

- [jemalloc](https://github.com/jemalloc/jemalloc) &mdash; FreeBSD and Firefox, [Rust until 1.32.0](https://blog.rust-lang.org/2019/01/17/Rust-1.32.0.html#jemalloc-is-removed-by-default)
- [tcmalloc](https://github.com/google/tcmalloc) &mdash; Google
- [mimalloc](https://github.com/microsoft/mimalloc) &mdash; Microsoft
- [libumem](https://github.com/gburd/libumem) &mdash; Solaris

There are [many more](https://github.com/daanx/mimalloc-bench#current-allocators), but
at the time of writing, mimalloc [claims to be the fastest](https://github.com/microsoft/mimalloc#Performance);
and they also published a cool [whitepaper](https://www.microsoft.com/en-us/research/uploads/prod/2019/06/mimalloc-tr-v1.pdf).

## How Do Modern Allocators Work?

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
>   always allocated using the mmap system call. The threshold is usually 256 KB.
>   The mmap method averts problems with huge buffers trapping a small allocation at
>   the end after their expiration, but always allocates an entire page of memory,
>   which on many architectures is 4096 bytes in size.

There are some great resources on modern, general-purpose allocators if you want
to dig deeper here:

- [Details on popular allocators on Wikipedia](https://en.wikipedia.org/wiki/C_dynamic_memory_allocation#Implementations)
  for some more details.
- [Overview of Malloc](https://sourceware.org/glibc/wiki/MallocInternals)
- [A look at how malloc works on the Mac](https://www.cocoawithlove.com/2010/05/look-at-how-malloc-works-on-mac.html).

It's a ✨ fascinating topic ✨ on its own, but we are mostly interested in **memory
handling for Rust programs** today, so let's move on.

## Stack and Heap Allocations

Computer memory is divided into _static_ and _dynamic memory_.
The lifetime of static memory is the entire duration of the program's execution,
and it's allocated at compile time.
In contrast, dynamic memory is more short-lived and gets allocated at runtime.

Static memory lives in the `GLOBAL` and `CODE` sections of a program, while
dynamic memory lives on the _stack_ or the _heap_.

Here's a diagram of the memory layout of a program:

{{ figure(src="memory.jpg" invert="true") }}

As you can see, the stack is a contiguous region of memory that grows and shrinks
as the program executes. Let's take a closer look at the stack.

### The Stack

{{ figure(src="stack_heap.jpg" invert="true") }}

You can think of a stack as a stack of dinner plates: you can only put a plate
on top and remove it from there. It's very simple, which is what makes it fast.

A register is used to store the address of the topmost element of the stack
which is known as Stack pointer. [On Intel x86 machines, this is a dedicated CPU
register called `SP`](https://en.wikipedia.org/wiki/Stack_register).

When you add a new element you need to increment the stack pointer.
To remove (or "pop") an element, just decrement the pointer.
Both operations can be done with just one CPU instruction.

The stack is where Rust allocates memory _by default_.
However you cannot store arbitrarily large things on the stack and the stack
gets cleaned up when you leave a function. This makes it somewhat limited to
things of which you know the size at compile-time and which have a limited
scope.

### The Heap

If you need more flexibility or you just can't tell the size of an object at
compile-time (e.g. because you read data from a user-specified file),
you can allocate memory on the heap at runtime instead. You can
freely allocate any memory address on the heap and its size is virtually
unlimited, however it is generally slower as it might require a syscall for
allocations and you might have to reallocate memory when growing things like a
vector.

(Reallocation is a process of copying the data from one memory location to
another and freeing the old memory.)

Since you can move stuff around on the heap and there is no fixed location for
each object, the allocator needs to keep track of what memory is already
allocated.

On top of that, if you remove things, you'll end up with "holes" between the
elements. This is called "memory fragmentation".
As a consequence you might have to stop and reorder items to free up some space,
which can cause some overhead. The flexibility comes with a price.

# Why Can't All Allocations Be Static?

The sizes of some datatypes cannot be known at compile-time. For example, you
might have a vector called students, but you don't know in advance how many
students it will hold. Dynamic memory allocation makes it possible to hold any
number of students as long as you have memory available.

More info on stack vs heap as well as syscalls
[here](https://www.linuxjournal.com/article/6390) and [here](http://web.mit.edu/rust-lang_v1.25/arch/amd64_ubuntu1404/share/doc/rust/html/book/first-edition/the-stack-and-the-heap.html#the-heap).

## Memory Management in Rust

Okay so programs need memory to store data and _someone_ has to manage it, right?
Either it's you or the language. In Python, PHP, Go, and Java it's the [garbage
collector](<https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)>)'s
job: It usually allocates memory on the heap and iterates over the entire
memory in regular intervals to clean up whatever isn't needed anymore. That's
pretty handy for the most part.

It's fine unless the garbage collector blocks the main thread.
That's why most modern GCs are a piece of art.
For example, did you know that the Golang garbage collector [only blocks for a few hundred **micro**seconds on average](https://go.dev/blog/ismmkeynote)?
In 99% of all cases, that's more than good enough.

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
to automatically allocate and free memory by checking the _liveliness_ of objects at compile-time.
That's a fancy way of saying "whoever allocated memory has to free it again" and
the Rust compiler knows who owns memory by keeping track of the [ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html).

When the owner goes out of scope, memory gets dropped:

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
    println!("{static_int}"); // Error: cannot find value of x in this scope
    println!("{dynamic_vec:?}"); // Error: cannot find value of x in this scope
}
```

What's brilliant about this is that the compiler can check at compile-time
if ownership is correctly managed. There is never a situation where
it's not clear whether a variable is still in use or not.
In my personal opinion this is Rust's main innovation.
It took the RAII principle from C++ and made it a compiler feature!
Programs simply won't compile if memory is not correctly managed.

## How Can I Spot an Allocation?

In the above example, we allocated memory on the stack and on the heap.
How can we tell which is which?

Here are some heuristics I use in daily life:

- **Is the type a standard data structure from std like `String`, `Vec`, `BTreeMap` or
  `HashSet`?**
  If yes, then there’s an allocation.
- **Does my type contain a `Box` or an `Rc` or an `Arc`?**
  If yes, then there’s an allocation.
- **Is my type `Copy`?** If yes, then there’s _probably_ no allocation going on.
  If not, then _maybe_ there’s allocation. (It's not always true, but again, we’re talking about heuristics here.)

A quick and dirty way to find allocations is by running
[ripgrep](https://github.com/BurntSushi/ripgrep) in your project folder

```bash
rg -e 'String::new' -e 'to_string()' -e 'to_owned()' -e 'Vec::new' -e 'vec!' -e 'BTreeMap::new' -e 'HashMap::new' -e 'HashSet::new' -e 'Box::new' -e 'Rc::new' -e 'Arc::new' -e 'read_to_string'
```

On top of that, crates that you use could also allocate, so you have to inspect
that code as well.

## How Does Allocation Work In Rust?

Zero copy is a lot of fun! Especially for representing datastructures.

The basic idea is that you stick to `&` references (or borrows) for all your
data. With zero-copy parsing, you store `&[u8]` or `&str` slice references to
the original text.

Often Rust parsers are implemented in terms of Iterators, where parsers in other
low-level languages would fill some buffer first. Instead of allocating dynamic
memory and copying data in to pass to later function calls, you use a buffer
given to you by reference or made on the stack, relying on rust’s lifetimes and
ownership semantics to guarantee that you’re looking at valid data. Other high
level languages sometimes encourage copying of data, which can be slow and waste
memory. Rust doesn’t discourage copying directly, but makes it much easier to
reason about memory semantics and thus write code that doesn’t perform any
copying. => lifetimes enable zero copy

Anything can go on the heap. If the type implements sized it can go on the
stack. At compile time, Rust needs to know how much space a type takes up. This
allows for safety and performance gains. In a language like Java you have no
choice, every object that isn't a primitive is on the heap.

Variables are always on the stack. E.g. let foobar = ... foobar is always on the
stack.

Now, foobar might be a pointer to something else. For example let foobar = &x.
foobar is on the stack since it's a variable, x is also on the stack since it's
a variable. So foobar is a pointer, that lives on the stack, and points to
someting on the stack.

nom zero copy parser https://www.youtube.com/watch?v=8mA5ZwWB3M0&t=928s

[Diagram] jemalloc System allocator the allocator might call brk or mmap, which
might be slow mmap asks the kernel to gives us some new virtual address space,
bascially a new memory segment. brk is used to change the size of an already
existing memory segment.

`man mmap man brk`

https://www.youtube.com/watch?v=HPDBOhiKaD8

These syscall might cause a lot of overhead -- e.g. when we don't have enough
RAM and the system starts swapping.

rust code -> new -> malloc -> brk/mmap

strace brk calls allocations
https://ysantos.com/blog/malloc-in-rust

"Now so far we have only looked at memory allocation on the OS level, through
system calls. But many programming languages don’t allocate memory by directly
invoking brk or mmap. In Linux they usually delegate this job to libc."

Creation of a variable on stack (aka local variable) just means to shift the
stack pointer by the size of that variable. That’s how you allocate local
variables—by a single pointer decrement operation (stack is organised from high
addresses to low addresses). It’s as fast as that.

Static variables (aka global variables) have their space reserved in the static
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

## How To Block Allocations Altogether

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

## Can I re-use allocations?

Bump alloc

String interning -> allocate a string only once, even if it occurs multiple times.
https://github.com/anderslanglands/ustr

- https://github.com/hawkw/thingbuf

The regex crate uses a wonderful library called thread_local-rs written by
/u/Amanieu for really fast thread safe access to a pool of previously
initialized values. The key is that it allows for dynamic per-object thread
local values as opposed to statically known thread locals like with the
thread_local! macro. https://github.com/Amanieu/thread_local-rs
https://github.com/frankmcsherry/recycler

bumpalo vec:
https://docs.rs/bumpalo/latest/bumpalo/collections/vec/struct.Vec.html

# How Are Rust Allocators Implemented?

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
