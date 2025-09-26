+++
title="On Choosing Rust"
date=2025-09-25
draft=false
[taxonomies]
tags=["rust", "dev", "culture"]
+++

Since most of my "serious" writing on Rust has moved to the [corrode blog](https://corrode.dev/blog), I can be a bit more casual on my personal blog and share some of my personal thoughts on the recent debate around using Rust in established software.

The two projects in question are git ([kernel thread](https://lore.kernel.org/git/20250904-b4-pks-rust-breaking-change-v1-0-3af1d25e0be9@pks.im/), [Hacker News Discussion](https://news.ycombinator.com/item?id=45312696)) and the recently rewritten coreutils in Rust, which will ship with Ubuntu 25.10 Quizzical Quokka ([Discourse post](https://discourse.ubuntu.com/t/carefully-but-purposefully-oxidising-ubuntu/56995)).

What prompted me to write this post is the [discussion on Twitter](https://x.com/nafonsopt/status/1968954376262652175) and a blog post titled ["Are We Chasing Language Hype Over Solving Real Problems?"](https://dayvster.com/blog/are-we-chasing-language-hype-over-solving-real-problems).

In both cases, the authors speculate about the motivations behind choosing Rust, and as someone who helps teams use Rust in production, I find those takes hilarious.

Back in the day when I started corrode, people always mentioned that Rust wasn't used in production.
As a consequence, we started the ['Rust in Production'](https://corrode.dev/podcast/) podcast to show that companies choose Rust for real-world applications. 
However, people don't like to be proven wrong, so that conspiracy theory has now morphed into "Big Rust" trying to take over the world.

Let's look at some of the claims made in the blog post and Twitter thread and see how these could be debunked pretty easily.

> "GNU Core Utils has basically never had any major security vulnerabilities in its entire existence" 

If only that were true.
A [quick CVE search](https://www.cve.org/CVERecord/SearchResults?query=coreutils) shows multiple security issues over the decades, including buffer overflows and path traversal vulnerabilities. Just a few months ago, a [heap buffer under-read](https://nvd.nist.gov/vuln/detail/CVE-2025-5278) was found in `sort`, which would cause a leak of sensitive data if an attacker sends a specially crafted input stream.

The GNU coreutils are one of the most widely used software packages worldwide with billions of installations and hundreds (thousands?) of developers looking at the code.
Yes, vulnerabilities still happen. 
No, it is not easy to write correct, secure C code.
No, not even if you're extra careful and disciplined.

`ls` is 5k lines long. (Check out the [source code](https://github.com/coreutils/coreutils/blob/master/src/ls.c)). That's a lot of code for printing file names and metadata and a big attack surface!

> "Rust can only ever match C performance at best and is usually slower"

Work by [Trifecta](https://trifectatech.org/initiatives/codegen/) shows that it is possible to write Rust code that is faster than C in some cases.
Especially in concurrent workloads and with memory safety guarantees.
If writing safe C code is too hard, try writing safe concurrent C code!

That's where Rust shines.
You can achieve ridiculous levels of parallelization without worrying about security issues.
And no, you don't need to litter your code with `unsafe` blocks.
Check out [Steve Klabnik's recent talk about Oxide](https://www.youtube.com/watch?v=q8qn0dyT3xc) where he shows that their bootloader and their preemptive multi-tasking OS, hubris -- both pretty core systems code -- only contains 5% of `unsafe` code each.
You can write large codebases in Rust with no unsafe code at all. 

As a trivial example, I sat down to rewrite `cat` in Rust one day.
The result was 3x faster than GNU `cat` on my machine. 
You can read the [post here](/2018/fastcat/).
All I did was use `splice` to copy data, which saves one memory copy. 
Performance is not only dependent on the language but on the algorithms and system calls you use.

If you play into Rust's strengths, you can match C's performance. 
At least there is no technical limitation, which would prevent this.
And at least I personally feel more willing to optimize my code more aggressively in Rust, because I don't have to worry about introducing memory safety bugs.
It feels like [I'm not alone](https://steveklabnik.com/writing/is-rust-faster-than-c/).

> "We reward novelty over necessity in the industry"

This ignores that most successful companies (Google, Meta, etc.) primarily use battle-tested tech stacks, not bleeding-edge languages.
These companies have massive codebases and cannot afford to rewrite everything in the latest trendy language.
But they see the value of using Rust for new components and gradually rewriting existing ones.
That's because [70% of security vulnerabilities are memory safety issues](https://corrode.dev/blog/why-rust/#reasons-for-using-rust-in-production) and these are extremely costly to fix.
If these companies could avoid switching to a new language, they would.

Besides, Rust is not exactly new anymore.
It's been stable for 10+ years!
The industry is moving slowly, but not that slowly.
You'd be surprised to find out how many established companies use Rust without even announcing it or thinking of it as "novelty".

> "It's part of the woke mind virus infecting software"

Imagine thinking memory safety is a political conspiracy.

> "100% orchestrated"

Multiple people in the Twitter thread were convinced this is some coordinated master plan rather than developers choosing better tools,
while the very maintainers of git and coreutils openly discussed their motivations in public forums for everyone to see.

> "They're trying to replace/erase C. It's not going to happen" 

They are right. C is not going away anytime soon.
There is just so much C/C++ code out there in the wild, and rewriting everything in Rust is not feasible.
The good news is that you can incrementally rewrite C/C++ code in Rust, one component at a time.
That's what the git maintainers are planning, by using Rust for new components.

> "They're rewriting software with a GNU license into software with an MIT license"

Even if you use Rust, you can still license your code under GPL or any other license you want.
Git itself remains GPL, and many Rust projects use various licenses, not only MIT.
The license fear is often brought up by people who don't understand how open source licensing works or it might just be FUD.

[MIT code is still compatible with GPL code](https://interoperable-europe.ec.europa.eu/licence/compatibility-check/GPL-2.0%20/MIT) and you can use both of them in the same project without issues.
It's just that the end product (the thing you deliver to your users, i.e. binary executables) are now covered by GPL because of its virality.

> "It's just developers being bored and wanting to work with shiny new languages" 

C developers are essentially going extinct.
The aging maintainers of C projects are retiring, and there are fewer new developers willing to pick up C just to maintain legacy code in their free time.
New developers want to work with modern tools and languages and that's pretty reasonable. 
Or would you want to maintain a 40-year-old COBOL codebase or an old Perl script?
We have to move on.

> "Why not build something completely new instead of rewriting existing tools?"

It's not that easy.
The code is only part of the story.
The other part is the ecosystem, the tooling, the integrations, the documentation, and the user base.
All of that takes years to build.
Users don't want to change their workflows, so they want drop-in replacements.
Proven interfaces and APIs, no matter how crude and old-fashioned, have a lot of value. 

But yes, new tools are being built in Rust as well.

> "They don't know how to actually solve problems, just chase trends" 

Talk about dismissing the technical expertise of maintainers who've been working on these projects for years and understand the pain points better than anyone.
If they were just chasing trends, they wouldn't be maintaining these projects in the first place!
These people are some of the most experienced developers in the world, and yet people want to tell them how to do their jobs.

## Conclusion

I could go on, but I think you get the point.

People who give Rust an honest chance know that it offers advantages in terms of memory safety, concurrency, and maintainability.
It's not about chasing hype but about long-term investment in software quality. 
As more companies successfully adopt Rust every day, it increasingly becomes the default choice for many new projects. 

If you're interested in learning more about using Rust in production, check out [my other blog](https://corrode.dev/blog) or listen to the [Rust in Production podcast](https://corrode.dev/podcast/).

Oh, and if you know someone who posts such takes, please forward them this post.
