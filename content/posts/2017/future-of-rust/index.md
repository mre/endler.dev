+++
title="The Future of Rust"
date=2017-04-27
path="2017/future-of-rust"

[extra]
comments = [
  {name = "Reddit", url = "https://www.reddit.com/r/rust/comments/67uzpc/the_future_of_rust/"}
]
+++

Let me first point out the obvious: yes, the title is a little sensationalist. Also
you might be asking why I should be entitled to talk about the future of Rust. After
all, I'm neither part of the Rust core team, nor a major contributor to the Rust
ecosystem. To that I answer: why not? It's fun to think about the future of
systems programming in general and Rust in particular.

{{ figure(src="./crab.svg", caption="Ferris is the inofficial Rust mascot",  credits="Illustration provided by [zooenvato for FreePik.com](http://www.freepik.com/zooenvato)") }}

You might have heard of the [near-term goals](https://internals.rust-lang.org/t/setting-our-vision-for-the-2017-cycle) that the core team has committed itself to. Faster compile times and a more gentle learning curve come to mind.
This post is not about that.
Instead, I want to explore some more exotic areas where Rust could shine in
five to ten years from now. To make it big, we need both, [roots and wings](http://www.goodreads.com/quotes/726646-there-are-two-things-children-should-get-from-their-parents).

## Data Science

Right now, the most popular languages for Data Science are Python, Java, R, and C++.

<figure>
  <img src="/img/posts/2017/future-of-rust/data-science-languages.png" alt="Programming language popularity for data science" />
  <figcaption>Programming language popularity for data science (<a href="https://www.ibm.com/developerworks/community/blogs/jfp/entry/What_Language_Is_Best_For_Machine_Learning_And_Data_Science?lang=en">Source</a>).
  </figcaption>
</figure>

We've observed that while prototypes are mostly written in dynamically typed
languages like Python and R, once an algorithm reaches production level quality
it is often [rewritten in faster languages such as C++](https://www.ibm.com/developerworks/community/blogs/jfp/entry/What_Language_Is_Best_For_Machine_Learning_And_Data_Science?lang=en) for scalability.
It is not unthinkable that Rust is going to be some healthy competition for C++ in the near future.
The benchmarks of [leaf](https://github.com/autumnai/leaf), a machine learning library written in Rust, are already nothing short of
impressive.

## Blockbuster games

[Games](https://www.reddit.com/r/rust_gamedev/comments/4qlftu/look_our_game_writen_entirely_in_rust/d4tz4r3/) are another area where Rust might shine. 
It's financially attractive for Game Studios to support multiple platforms without much
effort. `Cargo` and `rustup` make cross-compiling easy.
Modern libraries slowly fill the tooling gaps for large-scale game development.
[Rust's support for the Vulkan 3D graphics API](https://github.com/tomaka/vulkano) might already be the best of class.
The killer feature though is the unique combination of safety and performance.
If you ship a game to a million players and they throw money at you, you'll better make sure that it doesn't crash... [right?](http://www.gamingbolt.com/15-buggiest-games-ever-released)

That said, the first AAA Rust game might still be far in the future. [Here's Blizzard's standpoint on Rust in 2017](https://www.youtube.com/watch?v=Az5F4lwSljI&feature=youtu.be&t=23m50s).

## Systems Engineering

Maybe &mdash; eventually &mdash; we will also see formal verification of the Rust core. Projects like [RustBelt](http://plv.mpi-sws.org/rustbelt/) would then open new opportunities in safety-focused industries like the Space industry. Wouldn't it be nice to safely land a Spacecraft on Mars that is controlled by Rust? (Or by one of its spiritual successors.)
I wonder if [SpaceX](http://www.spacex.com/) is experimenting with Rust already...

## Integrating with other languages

There are many other areas I haven't even mentioned yet. For example, financial and medical software or Scientific Computing, just to name a few.
In all cases, Rust might be a good fit. Right now the biggest barrier to entry 
is probably the huge amount of legacy code. Many industries maintain large codebases in Cobol,
C or Fortran that are not easily rewritten.

Fortunately, Rust has been proven to work very nicely with other languages. 
Partly because of strong C-compatibility and partly because there is no Runtime or Garbage Collector.
A typical pattern is to optimize some core part of an application in Rust that has hard safety/performance
requirements, while leaving the rest untouched.
I think this symbiosis will only become stronger in the long run.
There are even ambitious projects like [Corrode](https://fosdem.org/2017/schedule/event/mozilla_translation_from_c_to_rust/) which attempt to translate C code to Rust automatically.


## Summary

Overall I see huge potential for Rust in areas where safety, performance or total control over the machine are essential. With languages like Rust and [Crystal](https://crystal-lang.org/), a whole class of errors is a thing of the past. No null pointers, no segmentation faults, no memory leaks, no data races.
I find it encouraging that future generations of programmers will take all that for granted.

