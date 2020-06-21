+++
title="What Happened To Programming In The 2010s?"
date=2020-01-01
draft=true
+++

A while ago, I read an article titled ["What Happened In The
2010s"](https://avc.com/2019/12/what-happened-in-the-2010s/) by Fred Wilson. The
article deals with the progress in technology and business in the last 10 years.
This inspired me to share my impressions on a much smaller, but related topic:
_What Happened To Programming In The 2010s?_

## Where to Start?

From a mile-high perspective, programming is still the same as a decade ago: you
punch your program into an editor, feed it to a compiler or interpreter, and receive some output.
But if take a closer look, we find that a _lot_ has changed around us. Many things we take for granted today were only introduced in the last decade.

Thinking back to 2009, I still wrote [jQuery](https://jquery.com/) plugins, ran websites on shared hosting services, and uploaded content via FTP.
Code was copy-pasted from dubious forums, other websites, or hand-transcribed from
books. [Stack Overflow](https://stackoverflow.com/) (launched September 15, 2008) was still in its infancy.
Version control was done with SVN &mdash; if at all.
[I signed up on Github](https://endler.dev/2018/github/) on 3rd January 2010.

While compiling this list, I had no idea just how much the industry has changed since 2010 (which feels like yesterday to me).

## An Explosion of New Programming Languages

The last decade saw a huge number of new and exciting programming languages! Go,
Kotlin, Swift, Dart, Rust, Typescript, Julia, Elixir, Elm, Crystal, Nim were all releasing their 1.0.

Even more exiting: **ALL** of the above languages are developed in the open now and the source code is
available on Github. That means, everyone can contribute to their development; a big testament to Open Source.

Each of those languages introduce new ideas, that were not mainstream before:

- **Stronger Type Systems**: Kotlin and Swift make [optional null types] more popular, Typescript brings
  types to JavaScript, Algebraic datatypes are common in
  Kotlin, Swift, Typescript, and Rust.
- **Better Performance**: Go made Goroutines and channels mainstream, Rust avoids Garbage Collector
  overhead.
- **Interoperability**: Dart compiles to JavaScript, Elixir interfaces with
  Erlang, Kotlin with Java, and Swift with Objective-C.

This is just a short list, but innovation in the programming language field has certainly accelerated.

[optional null types]: https://en.wikipedia.org/wiki/Nullable_type

## Old Dogs Learn new Tricks

But the older languages also did not stand still!

C++11 woke the language from its long winter sleep since the last major release in 1998. It introduced numerous new features like Lambdas, `auto` pointers, and range-based loops to the language.

Most languages adopted a quicker release cycle. Here's a list for some popular
languages:

| Language                | Current release cycle |
| :---------------------- | :-------------------- |
| Java                    | 6 months              |
| C                       | irregular             |
| Python                  | 12 months             |
| C++                     | ~ 3 years             |
| C#                      | ~ 12 months           |
| Visual Basic .NET       | ~ 24 months           |
| JavaScript (Ecmascript) | 12 months             |
| PHP                     | 12 months             |
| Swift                   | 6 months              |
| Ruby                    | 12 months             |
| Go                      | 6 months              |

At the beginning of the last decade, the latest PHP version was 5.3. We are at
7.4 now. (We actually skipped 6.0 &mdash; let's not talk about it.) Along the way it got over 100% faster. PHP is a truly modern programming language now with a thriving ecosystem.

Heck, even Visual Basic has tuples now.

## Death of Null

Close to the end of the last decade, 
Sir Charles Antony Richard Hoare,
https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/


Mainstream languages finally adopted safer alternatives to `null`: nullable types, `Option`, and `Result` types. Languages like Haskell had these features before, but they only became mainstream in the 2010s.

## Revenge of the Type System

Type systems were eschewed in the early 2000s.
Dynamic languages were the new hype.
But in the last decade, type systems made their stage comeback.
Typescript, Python, PHP (to name a few) started to embrace type systems.  
The trend goes towards type inference: add types to make your intent clearer for other humans and in the face of ambiguity.
Java, C++, and Rust are popular examples, which support type inference. I can only speak for myself, but I think writing Java has become way more ergonomic since a few years.

## Explosion of frameworks

With network speeds always getting faster and applications getting ever more complex, frameworks have reached new levels of popularity.
Think of frontend frameworks what you like, but we've come a long way.

* [Angular](https://angularjs.org/) in 2010
* [React](https://reactjs.org/) in 2013
* [Vue](https://vuejs.org/) in 2014
* [Svelte](https://svelte.dev/) in 2016
* ...and soon [Yew](https://github.com/yewstack/yew/)?

## Explosion of ecosystem packages

NPM hosts [1,320,921 packages](https://www.npmjs.com/). That's a million packages that somebody is maintaining.
Add to that [160,257 Ruby gems](https://rubygems.org/stats),
[241,363 Python projects](https://pypi.org/), and already [41,950 Rust crates](https://crates.io/).

Of course, there's the ocassional [leftpad](https://www.davidhaney.io/npm-left-pad-have-we-forgotten-how-to-program/), but overall this is a good thing. It means that we have to write way less library code ourselves and focus on the business value instead.

## Mobile First

By 2020, [over 50% of global web pages are served to mobile
phones](https://www.cleveroad.com/blog/discover-the-pros-and-cons-of-mobile-apps-vs-mobile-websites)
...in 2010, that number was at [2.9%](https://www.broadbandsearch.net/blog/internet-statistics).

{{ figure(src="./mobile.svg" caption="Rise of mobile traffic share within the last decade" credits="[Statista](https://www.statista.com/statistics/241462/global-mobile-phone-website-traffic-share/)") }}

## Modern ways to run our programs

Some notable releases

- [2012 - Vagrant](https://groups.google.com/forum/#!topic/vagrant-up/F7mG_R8uIoQ)
- [2012 - Spanner](https://www.zdnet.com/article/google-reveals-spanner-the-database-tech-that-can-span-the-planet/)
- [2014 - Docker](https://web.archive.org/web/20140611234638/http://blog.docker.com/2014/06/its-here-docker-1-0/)
- [2015 - Kubernetes](https://kuberneteslaunch.com/)
- [2015 - Atom (This links to the wonderful announcement video)](https://www.youtube.com/watch?v=Y7aEiVwBAdk)
- [2016 - Visual Studio Code](https://code.visualstudio.com/blogs/2016/04/14/vscode-1.0)
- [2017 - WebAssembly](https://webassembly.org/roadmap/)


[Raspberry Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) in 2012

## Moore's Law

Serverless
Cloud computing became the norm
Async
c10k problem
parallel concurrent execution
GPU
tensorflow
machine learning
iPython notebooks Data Science was born
"DevOps"
Machine Learning GPUs Ubiquitous Compute Async Everywhere
Parallel execution methods Fibers Channels Coroutines became mainstream Cloud
Computing
Crypto Currencies


## Unlikely Twists of Fate

* Microsoft is a cool company now, acquires Github, [open sources .NET](https://news.microsoft.com/2014/11/12/microsoft-takes-net-open-source-and-cross-platform-adds-new-development-capabilities-with-visual-studio-2015-net-2015-and-visual-studio-online/) announces the [Windows subsystem for Linux](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) (which should really be called Linux Subsystem for Windows).
Heck, even [Microsoft Calculator](https://github.com/Microsoft/calculator) is now open source.
Oh yeah, and the original [MS-DOS ](https://github.com/Microsoft/MS-DOS).
* [IBM aquires Red
Hat](https://www.redhat.com/en/blog/red-hat-ibm-creating-leading-hybrid-cloud-provider)

## New threads

New threads like
[Spectre](https://googleprojectzero.blogspot.com/2018/01/reading-privileged-memory-with-side.html)
and [Meltdown](https://news.ycombinator.com/item?id=16065845)
[Heartbleed](https://heartbleed.com/) Ransomware



This is not even close to everything that happened.
Think about the rise of social networks in the last decade.
Programming software for new devices like drones.

Knowing all this, I'm excited about the next ten years.
Software eats the world &mdash; with ever accelerating speed.