+++
title = "Launching a Side Project Backed by Github Sponsors"
date = 2020-08-21
[taxonomies]
tags=["oss", "business"]
[extra]
excerpt="""
Yesterday we launched analysis-tools.dev. It's a project about comparing static
analysis tools. What's best about the project is that it's completely
open-source and backed by sponsors. If you like to do the same, keep reading!
"""
+++

Yesterday we launched [analysis-tools.dev](https://analysis-tools.dev), and boy had I underestimated the response.

{{figure(src="website.jpg", link="https://analysis-tools.dev")}}

It's a side project about comparing static code analysis tools.
Static analysis helps improve code quality by detecting bugs in source code
without even running it.

What's best about the project is that it's [completely open-source](https://github.com/analysis-tools-dev/). We wanted to
build a product that wouldn't depend on showing ads or tracking users. Instead,
we were asking for sponsors on Github &mdash; that's it. We learned a lot in the
process, and if you like to do the same, keep reading!

## First, Some Stats

Everyone likes business metrics. Here are some of ours:

- The project started as an _awesome list_ on Github in [December
  2015](https://endler.dev/2017/obsolete/).
- We're currently listing 470 static analysis tools.
- Traffic grew continuously. Counting 7.5k stars and over 190 contributors at
  the moment.
- 500-1000 unique users per week.
- I had the idea to build a website for years now, but my coworker [Jakub]
  joined in May 2020 to finally make it a reality.

{{ figure(src="star-history.jpg", caption="Github stars over time. That graph screams BUSINESS OPPORTUNITY.",
credits="[star-history.t9t.io](https://star-history.t9t.io)") }}

"Why did it take five years to build a website!?", I hear you ask. Because I
thought the idea was so obvious that others must have tried before and failed.

I put it off, even though nobody stepped in to fill this niche.  
I put it off, even though I kept the list up-to-date for five years, just to
learn about the tools out there.  
You get the gist: don't put things off for too long. When ideas sound obvious, it's probably because they are.

## Revenue Model

It took a while to figure out how to support the project financially. We knew
what we didn't want: an SEO landfill backed by AdWords. Neither did we want to
"sell user data" to trackers.

We owe it to the contributors on Github to keep all data free for everyone.
How could we still build a service around it?
Initially, we thought about swallowing the infrastructure costs
ourselves, but we'd have no incentive to maintain the site or extend it with new
features.

[Github Sponsors](https://github.com/sponsors) was still quite new at that time. Yet, as soon as we realized
that it was an option, it suddenly clicked: Companies that are not afraid of a
comparison with the competition have an incentive to support an open platform
that facilitates that. Furthermore, we could avoid bias and
build a product that makes comparing objective and accessible.

Sponsoring could be the antidote to soulless growth and instead allow us to build
a lean, sustainable side business. We don't expect analysis-tools.dev ever to be
a full-time job. The market might be too small for that &mdash; and that's fine.

## Tech

Once we had a revenue model, we could focus on the tech. We're both engineers,
which helps with iterating quickly.

Initially, I wanted to build something fancy with
[Yew](https://github.com/yewstack/yew). It's a Rust/Webassembly framework and
your boy [likes Rust/Webassembly](https://endler.dev/2019/tinysearch/)...

I'm glad Jakub suggested something else: [Gatsby](https://www.gatsbyjs.com/). Now, let me be honest with
you: I couldn't care less about Gatsby. And that's what I said to Jakub: "I
couldn't care less about Gatsby." But that's precisely the point: not being
emotionally attached to something makes us focus on the job and not the tool.
We get more stuff done!

From there on, it was pretty much easy going: we used a starter template, Jakub
showed me how the GraphQL integration worked, and we
even got to use some Rust! The site runs on Cloudflare as an [edge
worker](https://workers.cloudflare.com/) built on top of Rust. (Yeah, I cheated
a bit.)

Count to three, MVP!

## Finding Sponsors

So we had our prototype but zero sponsors so far. What started now was (and
still is) by far the hardest part: convincing people to support us.

We were smart enough not to send cold e-mails because most companies ignore
them. Instead, we turned to our network and realized that developers reached out
before to add their company's projects to the old static analysis list on
Github.

These were the people we contacted first. We tried to keep the messages short
and personal.

What worked best was a medium-sized e-mail with some context and a reminder that
they contributed to the project before. We included a link to our [sponsors
page](https://github.com/sponsors/analysis-tools-dev/).

Businesses want reliable partners and a reasonable value proposal,
so a prerequisite is that the sponsor page has to be meticulously polished.

{{ figure(src="sponsors.jpg", caption="Our Github Sponsors page", link="https://github.com/sponsors/analysis-tools-dev") }}

Just like _Star Wars Episode IX_, we received mixed reviews: many people never
replied, others passed the message
on to their managers, which in turn never replied, while others again had no
interest in sponsoring open-source projects in general. That's all fair game:
people are busy, and sponsorware is quite a new concept.

> A little rant: I'm of the opinion that tech businesses don't nearly sponsor
> enough compared to all the value they get from Open Source. Would your company
> exist if there hadn't been a free operating system like Linux or a web server
> like Nginx or Apache when it was founded?

There was, however, a rare breed of respondents, which expressed interest but
needed some guidance. For many, it is the first step towards sponsoring _any_
developer through Github Sponsors / OpenCollective.

It helped that we use OpenCollective as our fiscal host, which handles invoicing
and donation transfers. [Their docs](https://docs.opencollective.com/help/)
helped us a lot when getting started.

The task of finding sponsors [is never
done](https://www.youtube.com/watch?v=qHfAaG34H30), but it was very reassuring
to hear from [DeepCode](https://www.deepcode.ai/) - an AI-based semantic
analysis service, that they were willing to take a chance on us.

Thanks to them, we could push product over the finishing line. Because of them,
we can keep the site free for everybody. It also means the website is kept free
from ads and trackers.

In turn, DeepCode gets exposed to many great developers that care about code
quality and might become loyal customers. Also, they get recognized as an
open-source-friendly tech company, which is more important than ever if you're
trying to sell dev tools. Win-win!

## Marketing

Jakub and I both had started businesses before, but this was the first truly
_open_ product we would build.

**Phase 1: Ship early 🚀**

We decided for a soft launch: deploy the site as early as possible and let the
crawlers index it. The fact that the page is statically rendered and follows
some basic SEO guidelines sure helped with improving our search engine rankings
over time.

**Phase 2: Ask for feedback from your target audience 💬**

After we got some organic traffic and our first votes, we reached out to our
developer friends to test the page and vote on tools they know and love. This
served as an early validation, and we got some honest feedback, which helped us
catch the most blatant flaws.

**Phase 3: Prepare announcement post 📝**

We wrote a blog post which, even if clickbaity, got the job done: [Static
Analysis is Broken &mdash; Let's Fix
It!](https://analysis-tools.dev/blog/static-analysis-is-broken-lets-fix-it) It
pretty much captures our frustration about the space and why building an open
platform is important. We could have done a better job explaining the technical
differences between the different analysis tools, but that's for another day.

**Phase 4: Announce on social media 🔥**

Shortly before the official announcement, we noticed that the search
functionality was broken (of course). Turns out, we hit the free quota limit on
[Algolia](https://algolia.com) a biiit earlier than expected. 😅 No biggie: quick
exchange with Algolia's customer support, and they moved us over to the
open-source plan (which we didn't know existed). We were back on track!

> Site note: Algolia customer support is top-notch. Responsive, tech-savvy,
> and helpful. Using Algolia turned out to be a great fit for our product.
> Response times are consistently in the low milliseconds and the integration
> with Gatsby was quick and easy.

{{ figure(src="tweet.jpg", caption="We got quite a bit of buzz from that
tweet: 63 retweets, 86 likes and counting",
link="https://twitter.com/matthiasendler/status/1296162427797671936") }}

Clearly, everyone knew that we were asking for support here, but we are thankful
for every single one that liked and retweeted. It's one of these situations
where having a network of like-minded people can help.

As soon as we were confident that the site wasn't _completely_ broken, we set off
to announce it on
[Lobste.rs](https://lobste.rs/s/n2ecfs/static_analysis_is_broken_let_s_fix_it)
(2 downvotes),
[/r/SideProject](https://www.reddit.com/r/SideProject/comments/icupeu/we_made_a_website_to_compare_470_static_analysis/)
(3 upvotes) and [Hacker News](https://news.ycombinator.com/item?id=24221708) (173
upvotes, 57 comments). Social media is kind of unpredictable.
It helps to cater the message to each audience and stay humble, though.

The response from all of that marketing effort was **nuts**:

{{ figure(src="traffic.jpg", caption="Traffic on launch day") }}

Perhaps unsurprisingly, the Cloudflare edge workers didn't break a sweat.

{{ figure(src="worker.jpg", caption="Edge worker CPU time on Cloudflare") }}

My boss [Xoan Vilas](https://twitter.com/xo4n) even did a quick performance
analysis and he approved. (Thanks boss!)

{{ figure(src="perf.jpg", link="https://twitter.com/xo4n/status/1296432035788193794") }}

High fives all around!

## Now what?

Of course, we'll add new features; of course, we have more plans for the future,
yada yada yada. Instead, let's reflect on that milestone: a healthy little
business with no ads or trackers, solely carried by sponsors. 🎉

Finally, I want you to [look deep inside yourself and find your own little
product to work on](https://www.youtube.com/watch?v=9XGyxOwM0tE). It's probably
right in front of your nose, and like myself, you've been putting it off for too
long. Well, not anymore! The next success story is yours. So go out and build
things.

Oh wait! ...before you leave, would you mind checking out
[analysis-tools.dev](https://analysis-tools.dev/) and smashing that upvote button
for a few tools you like? Hey, and if you feel super generous today
(or you have a fabulous employer that cares about open-source), why not check out
our [sponsorship page](https://github.com/sponsors/analysis-tools-dev/)?

{{ figure(src="team.jpg", caption="Jakub and me in Vienna, Austria. I'm not actually that small.") }}

[jakub]: https://github.com/jakubsacha
