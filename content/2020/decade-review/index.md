+++
title="What Happened In The 2010s - Programmer Edition"
date=2020-01-01
draft=true
+++

Recently, I read an article titled ["What Happened In The
2010s"](https://avc.com/2019/12/what-happened-in-the-2010s/) by Fred Wilson. It
is covering quite a wide variety of topics from tech to business. This inspired
me to share my impressions on a related subject: _How programming languages and
tools changed over the last decade._

## Where do we even start?

From a bird's eye view, programming computers is still the same as in 2009: you
write a program, feed it to a computer and get some output. But if we look
closer, we find that _a lot_ has changed in the past decade. Many things on the
list sound obvious becauswe we take them for granted now.

Thinking back to 2009, I still wrote [jQuery](https://jquery.com/) plugins, ran
a few websites on shared hosting services and uploaded content via FTP. Version
control was done with SVN &mdash; if at all. Code was copy-and-pasted from
dubious forums, other websites, or hand-transcribed from books. StackOverflow
was still in its infancy.

## Explosion of new programming languages

The last decade saw a big number of new and exciting programming languages: Go,
Kotlin, Swift, Dart, Rust, Typescript, Julia, Elixir, Elm, Crystal, Nim to name
a few.

**ALL** of the above are developed in the open now and the source code is
available on Github. That means, everyone can contribute development. Open
Source is the default now!

Each of those languages brought something new to the table, that made them
popular. Those features can be classified into a few categories:

- Type system: Kotlin and Swift support [nullable types], Typescript brings
  types to JavaScript,...
- Performance: Go adds Goroutines and channels, Rust avoids Garbage Collector
  overhead,...
- Interoperability: Dart compiles to JavaScript, Elixir interfaces with
  Erlang,...

[nullable types]: https://en.wikipedia.org/wiki/Nullable_type

By 2020, [over 50% of global web pages are served to mobile
phones](https://www.cleveroad.com/blog/discover-the-pros-and-cons-of-mobile-apps-vs-mobile-websites).

## Old Dogs learn new tricks

But the older languages also did not stand still!

C++11 pushed the language into a new era. Lambdas, `auto` pointers, range-based
loops, and more were added to the language.

Most languages adopted a quicker release cycle. Here's a list for some popular
languages:

| Language                | Release cycle |
| ----------------------- | ------------- |
| Java                    | 6 months      |
| C                       | irregular     |
| Python                  | 12 months     |
| C++                     | ~ 3 years     |
| C#                      | ~ 12 months   |
| Visual Basic .NET       | ~ 24 months   |
| JavaScript (Ecmascript) | 12 months     |
| PHP                     | 12 months     |
| Swift                   | 6 months      |
| Ruby                    | 12 months     |
| Go                      | 6 months      |

At the beginning of the last decade, the latest PHP version was 5.3. We are at
7.4 now. (We actually skipped 6.0. Let's not talk about it.) Along the way it
got 100% faster. It's a truly modern programming language now, with a thriving
ecosystem.

Heck, even Visual Basic has <<FEATURE>> now.

## Death of Null

Mainstream languages finally adopted safer alternatives to `null`: nullable
types, `Option`, and `Result` types Languages like Haskell had similar features
way before, but they only became mainstream in the 2010s.

## Revival of type systems

Type systems were eschewed in the early 2000s.

Typescript Python types PHP types

It goes in both directions, though. Java, C++, and Rust have type inference.

## Explosion of frameworks

Angular (2010) React (2013) Vue (2014) Svelte (2016)

## Explosion of ecosystem packages

NPM crates.io PyPi

Thread:
[leftpad](https://www.davidhaney.io/npm-left-pad-have-we-forgotten-how-to-program/)

## Modern ways to run our programs

- Vagrant 2010
- Docker 2013
- Kubernetes 2014
- WebAssembly
- Serverless

- Spanner
  https://www.zdnet.com/article/google-reveals-spanner-the-database-tech-that-can-span-the-planet/

Atom (2014) and Visual Studio Code (2015)

[Raspberry Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) in 2012

## Unbelievable twists of fate

Weird, unexpected things: Microsoft is a cool company now, aquires Github [open
sources
.NET](https://news.microsoft.com/2014/11/12/microsoft-takes-net-open-source-and-cross-platform-adds-new-development-capabilities-with-visual-studio-2015-net-2015-and-visual-studio-online/)
Windows subsystem for Linux
https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux

[IBM aquires Red
Hat](https://www.redhat.com/en/blog/red-hat-ibm-creating-leading-hybrid-cloud-provider)

.Net is open source Machine Learning GPUs Ubiquitous Compute Async Everywhere
Parallel execution methods Fibers Channels Coroutines became mainstream Cloud
Computing

## New chances

Crypto Currencies Garbage collection optional

## New threads

New threads like
[Spectre](https://googleprojectzero.blogspot.com/2018/01/reading-privileged-memory-with-side.html)
and [Meltdown](https://news.ycombinator.com/item?id=16065845)
[Heartbleed](http://heartbleed.com/) Ransomware

Software eats the world &mdash; and the speed is ever accelerating.
