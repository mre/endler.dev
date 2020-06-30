+++
title="What Happened To Programming In The 2010s?"
date=2020-06-30
draft=true
+++

A while ago, I read an article titled ["What Happened In The
2010s"](https://avc.com/2019/12/what-happened-in-the-2010s/) by Fred Wilson. The
article highlights key changes in technology and business during the last ten
years. This inspired me to think about a much smaller topic: _What Happened To
Programming In The 2010s?_

{% info() %} 
🚓 I probably forgot like 90% of what actually happened. Please
don't sue me. My goal is for you to reflect on the past so that you can make
better predictions about the <u>future</u>.
{% end %}

## Where To Start?

From a mile-high perspective, programming is still the same as a decade ago:

1. Punch program into editor
2. Feed to compiler (or interpreter)
3. Bleep Boop 🤖
4. Receive output

But if we take a closer look, a _lot_ has changed around us.
Many things we take for granted today didn't exist a decade ago.

## What Happened Before?

Back in 2009, I wrote [jQuery](https://jquery.com/) plugins, ran websites on
shared hosting services, and uploaded content via
[FTP](https://en.wikipedia.org/wiki/File_Transfer_Protocol). Sometimes code was
copy-pasted from dubious forums, tutorials on blogs, or even hand-transcribed
from books. [Stack Overflow](https://stackoverflow.com/) (which launched on
15<sup>th</sup> of September 2008) was still in its infancy. Version control
was done with [CVS](https://en.wikipedia.org/wiki/Concurrent_Versions_System) or
[SVN](https://en.wikipedia.org/wiki/Apache_Subversion) &mdash; or not at all.
[I signed up for Github](https://endler.dev/2018/github/) on 3<sup>rd</sup> of
January 2010. Nobody had even heard of a [Raspberry
Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) (which only got released in
2012).

{{ figure(src="xkcd_2324.png", credits="<a href='https://xkcd.com/2324/'>xkcd #2324</a>") }}

## An Explosion Of New Programming Languages

The last decade saw a huge number of new and exciting programming
languages.

[Crystal], [Dart], [Elixir], [Elm], [Go], [Julia], [Kotlin], [Nim], [Rust], [Swift], [TypeScript]
all released their first stable version!

Even more exciting: _all_ of the above languages are developed in the open now and the source code is
freely available on Github. That means, everyone can contribute to their development &mdash; a big testament to Open Source.

Each of those languages introduced new ideas, that were not widespread before:

- _Stronger Type Systems_: Kotlin and Swift made [optional null types]
  mainstream, TypeScript brought types to JavaScript, Algebraic datatypes are
  common in Kotlin, Swift, TypeScript, and Rust.
- _Interoperability_: Dart compiles to JavaScript, Elixir interfaces with
  Erlang, Kotlin with Java, and Swift with Objective-C.
- _Better Performance_: Go promoted Goroutines and channels for easier
  concurrency and impressed with a
  [sub-millisecond](https://blog.golang.org/ismmkeynote) Garbage Collector,
  while Rust avoids Garbage Collector overhead altogether thanks to ownership and borrowing.

This is just a short list, but innovation in the programming language field has
greatly accelerated.

[optional null types]: https://en.wikipedia.org/wiki/Nullable_type

## More Innovation in Older Langauges

Established languages didn't stand still either. A few examples:

C++ woke up from its long winter sleep an released C++11 after its last major
release in 1998. It introduced numerous new features like Lambdas, `auto`
pointers, and range-based loops to the language.

At the beginning of the last decade, the latest PHP version was 5.3. We're at
7.4 now. (We actually skipped 6.0 but I'm not ready to talk about it.) Along the
way it got over twice as fast.  [PHP is a truly modern programming language
now](https://stephencoakley.com/2020/06/10/dumb-reasons-to-hate-php) with a
thriving ecosystem.

Heck, even Visual Basic has tuples now. (Sorry, I couldn't resist.)

## Faster Release Cycles

Most languages adopted a quicker release cycle. Here's a list for some popular languages:

| Language                | Current release cycle |
| :---------------------- | :-------------------- |
| C                       | irregular             |
| C#                      | ~ 12 months           |
| C++                     | ~ 3 years             |
| Go                      | 6 months              |
| Java                    | 6 months              |
| JavaScript (ECMAScript) | 12 months             |
| PHP                     | 12 months             |
| Python                  | 12 months             |
| Ruby                    | 12 months             |
| Swift                   | 6 months              |
| Visual Basic .NET       | ~ 24 months           |

## The Slow Death Of Null

Close to the end of the last decade, in a talk from 25<sup>th</sup>of August 2009,
Tony Hoare described the `null` pointer as his [Billion Dollar
Mistake](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/).

A study by the Chromium project found that [70% of their serious security bugs were memory safety problems](https://www.chromium.org/Home/chromium-security/memory-safety) ([same for Microsoft](https://www.zdnet.com/article/microsoft-70-percent-of-all-security-bugs-are-memory-safety-issues/)). Fortunately the notion that our [memory safety problem isn't bad coders](https://medium.com/@sgrif/no-the-problem-isnt-bad-coders-ed4347810270)
has finally gained some traction.  
Many mainstream languages embraced safer alternatives to `null`: nullable
types, `Option`, and `Result` types. Languages like Haskell had these features
before, but they only gained popularity in the 2010s.

## Revenge of the Type System

Closely related is the the [debate about type
systems](https://www.johndcook.com/blog/2010/06/09/dynamic-typing-and-risk-homeostasis/).
The past decade has seen type systems make their stage comeback. TypeScript,
Python, PHP (to name a few) started to embrace them.

The trend goes towards type inference: add types to make your intent clearer for
other humans and in the face of ambiguity &mdash; otherwise skip them. Java,
C++, Kotlin, Swift, and Rust are popular examples with type inference support. I
can only speak for myself, but I think writing Java has become a lot more
ergonomic in the last few years.

## Exponential Growth Of Libraries and Frameworks

As of today, npm hosts [1,320,921 packages](https://www.npmjs.com/). That's over a million
packages that somebody else is maintaining for you. Add another [160,257 Ruby
gems](https://rubygems.org/stats), [241,363 Python projects](https://pypi.org/),
and top it off with [41,950 Rust crates](https://crates.io/).

{{ figure(src="module_counts.png", caption="Number of packages for popular programming languages.<br /> Don't ask me what happened to npm in 2019.", credits="<a href='http://www.modulecounts.com/'>Module Counts</a>" )}}

Of course, there's the occasional [leftpad](https://www.davidhaney.io/npm-left-pad-have-we-forgotten-how-to-program/), but overall this is a good thing. It means that we have to write less library code ourselves and can focus on business value instead.

We also went a bit crazy on frontend frameworks:

- [Angular](https://angularjs.org/) in 2010
- [React](https://reactjs.org/) in 2013
- [Vue](https://vuejs.org/) in 2014
- [Svelte](https://svelte.dev/) in 2016
- ...and soon [Yew](https://github.com/yewstack/yew/)?

## No Free Lunch

A review like this wouldn't be complete without taking a peek at [Moore's Law](https://en.wikipedia.org/wiki/Moore's_law).
It has held up surprisingly well in the last decade:

{{ figure(src="moore_2018.png" credits="<a href='https://en.wikipedia.org/wiki/Moore%27s_law'>Wikipedia</a>") }}

There's a catch, though.
Looking at single-core performance, the curve is flattening:

{{ figure(src="moore_single.jpg" credits="<a href='https://web.stanford.edu/~hennessy/Future%20of%20Computing.pdf'>Standford University: The Future of Computing</a>") }}

There is no free lunch anymore. Engineers have to find new ways of making their applications faster, e.g. by [embracing concurrent execution](https://en.wikipedia.org/wiki/Concurrent_computing).
Callbacks, coroutines, and eventually async/await became industry standards.

GPUs (Graphical Processing Units) became very powerful allowing for massively
parallel computations, which caused a renaissance of Machine Learning for practical use-cases:

> Deep learning becomes feasible, which leads to machine learning becoming
> integral to many widely used software services and applications.
> &mdash; [Timeline of Machine Learning on Wikipedia](https://en.wikipedia.org/wiki/Timeline_of_machine_learning)

_Compute_ is ubiquitous, so in most cases energy consumption plays a bigger role now than raw performance.

## Unlikely Twists Of Fate

- Microsoft is a cool kid now. It acquires Github, [open sources .NET](https://news.microsoft.com/2014/11/12/microsoft-takes-net-open-source-and-cross-platform-adds-new-development-capabilities-with-visual-studio-2015-net-2015-and-visual-studio-online/) announces the [Windows subsystem for Linux](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) (which should really be called Linux Subsystem for Windows).
  Even [Microsoft Calculator](https://github.com/Microsoft/calculator) is now open source.
  Oh yeah, and [MS-DOS](https://github.com/Microsoft/MS-DOS) and [.NET](http://news.microsoft.com/2014/11/12/microsoft-takes-net-open-source-and-cross-platform-adds-new-development-capabilities-with-visual-studio-2015-net-2015-and-visual-studio-online/) too.
- [IBM aquires Red Hat](https://www.redhat.com/en/blog/red-hat-ibm-creating-leading-hybrid-cloud-provider)
- [Linus Torvalds apologizes for his behavior, takes time off](https://lore.kernel.org/lkml/CA+55aFy+Hv9O5citAawS+mVZO+ywCKd9NQ2wxUmGsz9ZJzqgJQ@mail.gmail.com/).
- Open Source became the default for software development.

## Learnings

If you're now thinking: _Matthias, you totally forgot X_, then I totally brought that point home.
This is not even close to everything that happened.
You'd roughly need a decade to talk about all of it.

Personally, I'm excited about the *next* ten years.
Software eats the world &mdash; with ever faster pace.

[crystal]: https://crystal-lang.org/
[dart]: https://dart.dev/
[elixir]: https://elixir-lang.org/
[elm]: https://elm-lang.org/
[go]: https://golang.org/
[julia]: https://julialang.org/
[kotlin]: https://kotlinlang.org/
[nim]: https://nim-lang.org/
[rust]: https://www.rust-lang.org/
[swift]: https://swift.org/
[typescript]: https://www.typescriptlang.org/
