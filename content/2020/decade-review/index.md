+++
title="What Happened To Programming In The 2010s?"
date=2020-06-25
draft=true
+++

A while ago, I read an article titled ["What Happened In The
2010s"](https://avc.com/2019/12/what-happened-in-the-2010s/) by Fred Wilson. The
article hightlights key changes in technology and business during the last ten years.
This inspired me to think about a related topic: _What Happened To Programming In The 2010s?_

## Where To Start?

From a mile-high perspective, programming is still the same as a decade ago:

1. Punch program into editor
2. Feed to compiler (or interpreter)
3. Bleep Boop 🤖
4. Receive output

But if we take a closer look, a _lot_ has changed around us. 
Many things we take for granted today didn't exist a decade ago.

Back in 2009, I wrote [jQuery](https://jquery.com/) plugins, ran websites on shared hosting services, and uploaded content via [FTP](https://en.wikipedia.org/wiki/File_Transfer_Protocol).
Sometimes code was copy-pasted from dubious forums, tutorials on blogs, or even hand-transcribed from
books. [StackOverflow](https://stackoverflow.com/) (launched on 15<sup>th</sup> of September 2008) was still in its infancy.
Version control was done with [CVS](https://en.wikipedia.org/wiki/Concurrent_Versions_System) or [SVN](https://en.wikipedia.org/wiki/Apache_Subversion) &mdash; or not.
[I signed up for Github](https://endler.dev/2018/github/) on 3<sup>rd</sup> of January 2010.
Nobody had heard of a [Raspberry Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) (which got released in 2012).

{{ figure(src="xkcd_2324.png", credits="<a href='https://xkcd.com/2324/'>xkcd #2324</a>") }}

## An Explosion Of New Programming Languages

The last decade has seen a huge number of new and exciting programming
languages! 

[Crystal], [Dart], [Elixir], [Elm], [Go], [Julia], [Kotlin], [Nim], [Rust], [Swift], [Typescript]
all released their first stable version.

Even more exciting: *all* of the above languages are developed in the open now and the source code is
freely available on Github. That means, everyone can contribute to their development; a big testament to Open Source.

Each of those languages introduced new ideas, that were not mainstream before:

- *Stronger Type Systems*: Kotlin and Swift made [optional null types]
  mainstream, Typescript brought types to JavaScript, Algebraic datatypes are
  common in Kotlin, Swift, Typescript, and Rust.
- *Interoperability*: Dart compiles to JavaScript, Elixir interfaces with
  Erlang, Kotlin with Java, and Swift with Objective-C.
- *Better Performance*: Go promoted Goroutines and channels for better
  concurrency and impressed with a
  [sub-millisecond](https://blog.golang.org/ismmkeynote) Garbage Collector,
  while Rust avoids Garbage Collector overhead altogether thanks to ownership and borrowing.

This is just a short list, but innovation in the programming language field has greatly accelerated.

[optional null types]: https://en.wikipedia.org/wiki/Nullable_type

## Old Dogs Learn New Tricks

But the grey-haired languages didn't stand still either!

C++ woke up from its long winter sleep an released C++11 after the last major release in 1998. It introduced numerous new features like Lambdas, `auto` pointers, and range-based loops to the language.

Most languages adopted a quicker release cycle. Here's a list for some of the popular
languages:

| Language                | Current release cycle |
| :---------------------- | :-------------------- |
| C                       | irregular             |
| C#                      | ~ 12 months           |
| C++                     | ~ 3 years             |
| Go                      | 6 months              |
| Java                    | 6 months              |
| JavaScript (Ecmascript) | 12 months             |
| PHP                     | 12 months             |
| Python                  | 12 months             |
| Ruby                    | 12 months             |
| Swift                   | 6 months              |
| Visual Basic .NET       | ~ 24 months           |

At the beginning of the last decade, the latest PHP version was 5.3. We are at
7.4 now. (We actually skipped 6.0 but I'm not ready to talk about it.)
Along the way it got over twice as fast. 
PHP is a truly modern programming language now with a thriving ecosystem.

Heck, even Visual Basic has tuples now. (I'm sorry.)

## The Slow Death Of Null

Close to the end of the last decade, in a talk on 25<sup>th</sup>of August 2009,
Tony Hoare described the `null` pointer as his [Billion Dollar
Mistake](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/).

A study by the Chromium project found that [70% of their serious security bugs were memory safety problems](https://www.chromium.org/Home/chromium-security/memory-safety). [Microsoft agrees](https://www.zdnet.com/article/microsoft-70-percent-of-all-security-bugs-are-memory-safety-issues/).
Okay, our legacy codebases may look like the set of a Mad Max film, but fortunately a lot has happened in the last decade.
The notion that [memory safety problem isn't bad coders](https://medium.com/@sgrif/no-the-problem-isnt-bad-coders-ed4347810270)
has finally gained more traction.

Mainstream languages finally embraced safer alternatives to `null`: nullable
types, `Option`, and `Result` types. Languages like Haskell had these features
before, but they only became mainstream in the 2010s.


## Revenge of the Type System

Type systems were eschewed in the early 2000s.
🌈 Dynamic languages were the new hotness.
But in the past decade, type systems made their stage comeback.
Typescript, Python, PHP (to name a few) started to embrace them.  
The trend goes towards type inference: add types to make your intent clearer for other humans and in the face of ambiguity (otherwise skip them).
Java, C++, and Rust are popular examples, which support type inference. I can only speak for myself, but I think writing Java has become a lot more ergonomic in the few years.

## Frameworks

With ever faster network speeds and more and more complex web applications,
frameworks have reached unseen levels of popularity. Think of frontend
frameworks what you want, but we've come a long way. (The same is true for
backend frameworks)

* [Angular](https://angularjs.org/) in 2010
* [React](https://reactjs.org/) in 2013
* [Vue](https://vuejs.org/) in 2014
* [Svelte](https://svelte.dev/) in 2016
* ...and soon [Yew](https://github.com/yewstack/yew/)?

## Exponential Growth Of Libraries

NPM hosts [1,320,921 packages](https://www.npmjs.com/). That's over a million
packages that somebody else is maintaining for you. Add another [160,257 Ruby
gems](https://rubygems.org/stats), [241,363 Python projects](https://pypi.org/),
and top it off with [41,950 Rust crates](https://crates.io/).

{{ figure(src="module_counts.png", caption="Number of packages for popular programming languages.", credits="<a href='http://www.modulecounts.com/'>Module Counts</a>" )}}

Of course, there's the occasional [leftpad](https://www.davidhaney.io/npm-left-pad-have-we-forgotten-how-to-program/), but overall this is a good thing. It means that we have to write less library code ourselves and can focus on the business value instead.

## Mobile First

By 2020, [over 50% of global web pages are served to mobile
phones](https://www.cleveroad.com/blog/discover-the-pros-and-cons-of-mobile-apps-vs-mobile-websites)
...in 2010, that number was [2.9%](https://www.broadbandsearch.net/blog/internet-statistics).
Time to test your site on mobile more often, I guess.

{{ figure(src="./mobile.svg" caption="Rise of mobile traffic share within the last decade" credits="[Statista](https://www.statista.com/statistics/241462/global-mobile-phone-website-traffic-share/)") }}

## DevOps And Modern Application Deployment

Some notable releases

- [2012 - Vagrant](https://groups.google.com/forum/#!topic/vagrant-up/F7mG_R8uIoQ) &mdash; What if development environments were easy?
- [2014 - Docker](https://web.archive.org/web/20140611234638/http://blog.docker.com/2014/06/its-here-docker-1-0/) &mdash; What if containerized applications were easy?
- [2015 - Kubernetes](https://kuberneteslaunch.com/) &mdash; What if managing clusters was easy?
- [2017 - WebAssembly](https://webassembly.org/roadmap/) &mdash; How can we run the same code on all machines and browsers?

There's a trend to commoditize application development and deployment.
Cloud computing became the norm.
By the end of the 2010s, companies started moving towards [serverless architectures](https://www.thoughtworks.com/de/radar/techniques/serverless-architecture).

## No Free Lunch

A review like this wouldn't be complete without taking a peek at [Moore's Law](https://en.wikipedia.org/wiki/Moore's_law).
It has held up surprisingly well in the last decade:

{{ figure(src="moore_2018.png" credits="<a href='https://en.wikipedia.org/wiki/Moore%27s_law'>Wikipedia</a>") }}

This is only part of the story, though.
Looking at single-core performance, the improvements are less visible:

{{ figure(src="moore_single.jpg" credits="<a href='https://web.stanford.edu/~hennessy/Future%20of%20Computing.pdf'>Standford University: The Future of Computing</a>") }}

There is no free lunch anymore. Engineers had to find new ways of making their applications faster, e.g. by leveraging multiple cores.
Callbacks, coroutines, and eventually async/await became industry standards for concurrent execution.

*Compute* is ubiquitous, so in most cases energy consumption plays a bigger role now than raw performance.

Performance is still relevant for training machine learning applications thanks to GPU.
iPython notebooks Data Science was born


Machine Learning GPUs Ubiquitous Compute Async Everywhere
Crypto Currencies

## Unlikely Twists Of Fate

* Microsoft is a cool kid now. It acquires Github, [open sources .NET](https://news.microsoft.com/2014/11/12/microsoft-takes-net-open-source-and-cross-platform-adds-new-development-capabilities-with-visual-studio-2015-net-2015-and-visual-studio-online/) announces the [Windows subsystem for Linux](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) (which should really be called Linux Subsystem for Windows).
Even [Microsoft Calculator](https://github.com/Microsoft/calculator) is now open source.
Oh yeah, and [MS-DOS](https://github.com/Microsoft/MS-DOS) and [.NET](http://news.microsoft.com/2014/11/12/microsoft-takes-net-open-source-and-cross-platform-adds-new-development-capabilities-with-visual-studio-2015-net-2015-and-visual-studio-online/) too.
* [IBM aquires Red Hat](https://www.redhat.com/en/blog/red-hat-ibm-creating-leading-hybrid-cloud-provider)
* [Linus Torvalds apologizes for his behavior, takes time off](https://lore.kernel.org/lkml/CA+55aFy+Hv9O5citAawS+mVZO+ywCKd9NQ2wxUmGsz9ZJzqgJQ@mail.gmail.com/)

## New Threads

New threads like
[Spectre](https://googleprojectzero.blogspot.com/2018/01/reading-privileged-memory-with-side.html)
and [Meltdown](https://news.ycombinator.com/item?id=16065845)
[Heartbleed](https://heartbleed.com/) Ransomware


If you're now thinking: *Matthias, you totally forgot X*, then I totally brought that point home.
This is not even close to everything that happened.
You'd roughly need a decade to talk about all of it.

Knowing all this, I'm excited about the next ten years.
Software eats the world &mdash; with ever accelerating speed.


[Crystal]: https://crystal-lang.org/
[Dart]: https://dart.dev/
[Elixir]: https://elixir-lang.org/
[Elm]: https://elm-lang.org/
[Go]: https://golang.org/
[Julia]: https://julialang.org/
[Kotlin]: https://kotlinlang.org/
[Nim]: https://nim-lang.org/
[Rust]: https://www.rust-lang.org/
[Swift]: https://swift.org/
[Typescript]: https://www.typescriptlang.org/