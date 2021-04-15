+++
title="Starting A Print-On-Demand Business As A Software Engineer"
date=2021-01-22
[taxonomies]
tags=["business"]
+++

One day I had the idea to make a print of my Github timeline.
I liked the thought of bringing something "virtual" into the real world. 😄

So I called up my friend [Wolfgang](https://twitter.com/schafele) and we built [codeprints](https://codeprints.dev).
It's my first "physical" product, so I decided to share my learnings.

{{ figure(src="tweet_felix.jpg", caption="[Felix Krause](https://krausefx.com/) of [fastlane](https://fastlane.tools/) fame was one
of our first customers and we are very thankful for this tweet promoting our
service, which gave us a huge traffic boost.", link="https://twitter.com/KrauseFx/status/1348546742644580353") }}

## Launching Is Hard, So Launch Early

Even though I knew that launching early was vital, I still didn't want to
"commit" to the final design shortly before the planned go-live. There was always that last bug to fix or that little extra feature to implement.
For example, I wanted to offer two designs/layouts: the classic Github contribution timeline and a graph-based design for repositories.
In cases like that, it helps to have a co-founder.
Wolfgang convinced me that multiple layouts were not needed for the MVP and that whatever we'd come up with would probably be wrong anyway without getting early user feedback.
He was right. Without Wolfgang, the shop would probably still not be live today.
We have a much clearer vision now of what people want to see, thanks to launching early. Turns out users were not really interested in the graph-based design after all, and it would have been a waste of time to create it.

{% info() %}
**Lesson learned:**
Even if you know all the rules for building products, it's
different when applying them in practice for the first time. We'll probably
never be completely happy with the shop functionality, but it's better to launch
early and make incremental improvements later.
{% end %}

## Software Development Is Easy

When we started, my main concern was software development. The frontend and the
backend needed to be coded and work together. We didn't want to run into Github rate-limiting issues in case there were many users on the site. I was also
thinking a lot about which web frontend to use. Should we build it in Rust using
[Yew](https://github.com/yewstack/yew) or better go with [Gatsby](https://www.gatsbyjs.com/)?

Turns out writing the code is the easy part.

Being software engineers, it didn't take us too long to implement the backend
API and we quickly found a decent template for the frontend. Most of our time
was spent thinking about the product, the user experience,
financing, taxes, the shipping process, marketing, and
integrating customer feedback.
These were all things I had (and still have) little experience in.

Wolfgang suggested to "just use Shopify and the default template" to get started
quickly. In hindsight, it was the absolute right decision. I always thought
Shopify was for simple mom-and-pop stores, but it turns out it's highly
customizable, integrates well with pretty much anything, and offers excellent tooling
like [themekit](https://shopify.github.io/themekit/). Payments, refunds,
discounts, customer analytics: it's all built into the platform. It
saved us sooo much development time.

{{ figure(src="tweet_product.jpg", link="https://twitter.com/matthiasendler/status/1349308007839109122") }}

{% info() %}
**Lesson learned:**
There are many [unknown
unknowns](https://medium.com/datadriveninvestor/known-knowns-unknown-knowns-and-unknown-unknowns-b35013fb350d)
&mdash; things we are neither aware of nor understand &mdash; when starting a project.
Try to get to the root of the problem as soon as possible to save time and avoid
the [sunk cost fallacy](https://en.wikipedia.org/wiki/Sunk_cost).
{% end %}

## Users Expect Great UI/UX

Giants like Amazon, Facebook, and Netflix have raised customer
expectations for great UX. They spend millions polishing their websites and getting every detail right. As a result, their sites work _just right_ for millions of customers and on every device.

An indie shop does not have these resources. Nevertheless, many customers expect the same quality user experience as on other sites they use.
Being on the other side of the fence for the first time, I learned how hard it
is to build a user interface that works for 90% of the people. Every little
detail &mdash; like the order of form fields &mdash; makes a huge difference. Get too
many details wrong, and you lose a customer.

Those things can only be found by watching real users use your product. I promise you, it will be eye-opening!

{% info() %}
**Lesson learned:**
Watch potential customers use your service. It will be
painful at first, but will improve the quality of your product. Use standard
frameworks for shops if you can because they get many UI/UX details
right out of the box. [WooCommerce](https://woocommerce.com/) or
[Shopify](https://www.shopify.com/) come to mind.
{% end %}

## Building Products Means Being Pragmatic

We have many ideas for future products. Many friends and customers tell us about
potential features all the time, but the problem is how to prioritize them.
Most ideas won't work at scale: It's tricky to find a supplier that has a
product on offer, is cheap, ships worldwide, and has a working integration with
your shop-system. So we have to regularly scrap product ideas, simply
because our suppliers' support is not there. On top of that, we run the
business next to our day job and other
responsibilities, so we need to make use of our time as efficiently as possible.

{% info() %}
**Lesson learned:**
Making services look effortless is hard work. Time is your biggest constraint.
You'll have to say "no" more often than you can say "yes".
{% end %}

{{ figure(src="whereby.jpg", caption="Due to the pandemic, codeprints was
entirely built remotely. More people should give [whereby](https://whereby.com/)
a try.") }}

## Getting Traction As A Small Business

It has never been easier to launch a shop. Services like Shopify, Stripe, and a
host of suppliers make starting out a breeze. On the other hand, there is a lot
more competition now that the barrier to entry is so low.

**Thousands** of services are constantly competing for our attention. On top of
that, most customers just default to big platforms like Amazon, AliExpress, or eBay
for their shopping needs these days, and search engines send a big chunk of the traffic there.

Since our product is custom-made, we can not offer it on those bigger platforms.
As an indie shop, we get most visitors through word of mouth, exceptional
customer support, and advertising where developers hang out:
[Twitter](https://twitter.com/KrauseFx/status/1348546742644580353), [Reddit](https://www.reddit.com/r/github/comments/kvvd3j/i_just_got_my_github_contribution_wall_art_from/), [HackerNews](https://news.ycombinator.com/item?id=25749287), [Lobste.rs](https://lobste.rs/s/b5fbw8/create_personal_prints_from_your_github), and friends. It's essential to focus on
providing value on those platforms; a plain marketing post won't get you any attention. Other
platforms like LinkedIn, Facebook, ProductHunt, or IndieHackers could also work, but our target audience (OSS developers with an active Github profile) doesn't
hang out there that much.

{% info() %}
**Lesson learned:** Always know where your customers are and understand their needs.
{% end %}

## Finding A Niche Is Only Half The Job

[Common market wisdom](https://www.reddit.com/r/startups/comments/53fynp/niche_market_and_peter_thiels_monopoly_theory/) is to find niche and grow from within. With codeprints we definitely found our niche: the audience is very
narrow but interested in our geeky products. There are 56 million developers on
Github today; that's a big target audience. Most profiles are not very active,
though. To make a print look attractive, you'd have to consistently commit
code over a long period of time &mdash; many years. If we assume that only 1% of
devs are active, that limits our target audience to 560.000 users. That's still
a big but much smaller market. Now, if only 1% of these people find the shop and
order something (which would be quite a good ratio), we're looking at 5.600
orders total. Not that much!

In order to extend that audience, one could either increase the number of
potential customers or focus on getting more of the existing potential customers
on the page.
In our case, we expanded by offering a one-year layout, reducing the
required level of Github activity for a cool print. We are also working on making
emptier profiles look more interesting and highlighting the value-producing part
of open source contribution. Every contribution counts &mdash; no matter how tiny.

{% info() %}
**Lesson learned:**
Make sure that your niche market is not too narrow so that you can make a sustainable business out of it.
{% end %}

{{ figure(src="tweet_orta.jpg", caption="Early adopters like [Orta
Therox](https://orta.io/) are incredibly precious when starting out. Not
everybody has a rockstar profile like that, though (and that's fine).",
link="https://twitter.com/orta/status/1350058678418878465") }}

## Make User Feedback Actionable

Initial customer feedback is precious. You should focus on every word these
customers say as they believe in your product and want you to win. (They voted
with their wallet after all.) Feedback from
friends is helpful, too, but I usually apply a bigger filter to that. Not all
of my friends are software developers, and while they all mean well, what they
tell me might be different from what they mean. It's like they
are asking for [faster
horses](https://hbr.org/2011/08/henry-ford-never-said-the-fast) when what they
really want is a car.
Feedback on social media can be... snarky at times; be prepared for that! Your job
is to find the grain of truth in every statement and focus on constructive
advice.

For example, take [this feedback](https://www.reddit.com/r/github/comments/kvvd3j/i_just_got_my_github_contribution_wall_art_from/gj1g015?utm_source=share&utm_medium=web2x&context=3) we got:

> How lazy can someone be to pay €36 for this.

You could turn it around to make it constructive:

> Can I get a cheaper version to print myself?

And that is some valuable feedback. We could provide a downloadable version in
the future!

{% info() %}
**Lesson learned:**
It takes practice to extract actionable feedback from user input and make it fit your product vision.
{% end %}

## Summary

2020 was a crazy year.
I helped launch two small side-businesses, codeprints and
[analysis-tools.dev](https://endler.dev/2020/sponsors/).

Both have an entirely different revenue model, but
they have one thing in common: they were **super fun** to build! 🤩
It's motivating to look back at those achievements sometimes...
That print of 2020 pretty much encapsulates those feelings for me.
(Note the greener spots in August and September, which is when we launched
analysis-tools and the days in December when we built codeprints.)

{{ figure(src="vertical.jpg", caption="My coding year in review using our new
vertical layout.<br />Here's to
building more products in 2021.", link="https://codeprints.dev") }}

Let me know if you found that post helpful and reach out if you have questions.
Oh and if you're looking for a unique way to decorate your home office, why not
get your own print from [codeprints](https://codeprints.dev)? 😊

P.S.: If you're a product owner and you're looking for a unique present for your
team, [get in contact](mailto:support@codeprints.dev?subject=codeprints%20for%20teams&body=Hi%20there) and be the first to get an invite to a private beta.
