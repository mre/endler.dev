+++
title="Running A Printing Business As A Software Engineer"
date=2021-01-20
draft=true
+++

Like many people, I spend a lot of time in my home office. 
I wanted to decorate it with something unique that would motivate me every day.

One day I had the idea to make a print of my Github timeline.
My open source contributions are something personal that I care deeply about
and I liked the thought of bringing something "virtual" into the real world. 😄

So in December, my friend Wolfgang built a website for [making art prints of your Github timeline](https://codeprints.dev)

This was the first "physical" product I helped build. I decided to write about my learnings to help others who are planning something similar.

## Launching is hard

Even though I knew that launching early was vital, I still didn't want to
"commit" to the final design shortly before the planned go-live. There was always that last bug to fix or this little extra feature to implement.
For example, I wanted to offer two designs/layouts: the classic Github contribution timeline and a graph-based design for repositories.
In cases like that, it helps to have a co-founder that is more business-oriented.
He convinced me that multiple layouts were not needed for the MVP and that whatever we'd come up with would probably be the wrong design anyway without getting early user feedback.
He was right. Without Wolfgang, the shop would probably still not be live today.
We have a much clearer vision now of what people want to see, thanks to launching early. Turns out users were not really interested in the graph-based design after all, and it would have been a waste of time to create it.

**Lesson learned:**
Even if you know all the rules for building products, it's
different when applying them for the first in practice. We'll probably never be completely happy with the shop functionality, but it's better to launch early and make incremental improvements after.

## Software development is easy

When we started, my main concern was software development. The frontend and the
backend needed to be coded and work together. We didn't want to run into Github rate limiting issues in case there were many users on the site. I was also
thinking a lot about which web frontend to use. Should I build it in Rust using
Yew? Or Gatsby?
Turns out that's the easy part. Being software engineers, it didn't take long to implement the backend API, and we quickly found a decent template for the frontend.
Most of our time was spent thinking about the product, the user experience,
handling finances and taxes, the shipping process, research, marketing, and
integrating customer feedback.
These were all things I had (and still have) little experience in.
Wolfgang suggested to just use Shopify and the default template to get started quickly. In hindsight, it was the absolute right decision. I always thought
Shopify was for simple mom-and-pop shops, but it turns out it's highly
customizable, integrates with pretty much everything, and offers excellent tooling
like themekit. Payments, refunds,
discounts, customer analytics, and more are all built into the platform. It
saved us so much development time in the beginning.

**Lesson learned:**
There are many "unknown unknowns" when starting a project.
Try to get to the root of the problem as soon as possible to save time and avoid
the sunk cost fallacy.

## Great UI/UX is a must

Giants like Amazon, Facebook, and Netflix have raised customer
expectations for great UX. They spend millions polishing their websites and getting every detail right. As a result, their sites work just right for millions of customers and on every device.

An indie shop does not have these resources. Nevertheless, many customers expect the same quality user experience as on other sites they use.
Being on the other side for the first time, I learned how hard it is to build a user interface that works for 90% of the people. Every little detail -- like the order of form fields -- makes a huge difference. Get too many details wrong, and you lose a customer.

Those things can only be found by watching real users use your product. I promise you, it will be eye-opening!

**Lesson learned:**
Watch potential customers use your product. It will be
painful but change the quality of your product for the better. Use standard
frameworks for shops if you can because they get many UI/UX details
right out of the box. [WooCommerce](https://woocommerce.com/) or
[Shopify](https://www.shopify.com/) come to mind.

## Building products means being pragmatic  

We have many ideas for future products. Many friends and customers tell us about
good ideas all the time. The problem is not to come up with new ideas but how to prioritize them.
Most products won't work at scale: It's tricky to find a supplier that has a
product on offer, is cheap, ships worldwide, has a working integration with your shop-system.
So we have to cut product features all the time, simply because our suppliers' support is not there.
On top of that, we run the business next to our day job and other
responsibilities, so we need to make use of our time as well as possible.

**Lesson learned:**
Making the product-side look effortless is a lot of hard
work. You'll have to say "no" more often than you can say "yes".

## Getting traction as a small business

It has never been easier to launch a shop. Services like Shopify, Stripe, and a host of suppliers make building it a breeze. On the other hand, there is a lot more competition now the barrier to entry is so low. Thousands of shops are fighting for attention. On top of that, most customers buy on big platforms like Amazon, AliExpress, or eBay these days, and search engines optimize for those.
Since our product is custom-made, we can not offer it on those bigger platforms.
So to get visibility as an indie shop, we focus on word of mouth thanks to exceptional customer attention and advertising where developers hang out:
Twitter, Reddit, HackerNews, Lobste.rs, and others. It's essential to focus on
providing value on those platforms, as plain marketing won't get any traction. Other
platforms like Linkedin, Facebook, ProductHunt, or IndieHackers could work, too, but our target audience (OSS developers with an active Github profile) don't
hang around there that much.

**Lesson learned:** Always know where your customers are and understand their needs.

## Finding a niche is only half the job

[Common market wisdom](https://www.reddit.com/r/startups/comments/53fynp/niche_market_and_peter_thiels_monopoly_theory/) is to find niche and grow from within. With codeprints we definitely found our niche: the audience is very
narrow but interested in our geeky products. There are 56 million developers on
Github today. That's a big target audience. Most profiles are not very active,
though. To make a print look attractive, you'd have to consistently commit
code over a long period of time -- many years. If we assume that only 1% of
devs are active, that limits our target audience to 560.000 users. That's still
a big but much smaller market. Now, if only 1% of these people find the shop and
orders something (which would be quite a good outcome), we're looking at 5600
orders total. Not that much!
In order to extend that audience, one could either increase the number of
potential customers or focus on getting more of the existing potential customers
on the page.
In our case, we expanded by offering a stylish one-year layout, reducing the
required level of activity for a cool print. We are also working on making
emptier profiles look more interesting and highlighting the value-producing part
of open source contribution -- no matter how small.

**Lesson learned:**
Make sure that your niche market is not too narrow so that you can build a
sustainable business from it.

## Be careful with feedback

Customer feedback is precious. You should focus on every word
they say as they believe in your product and want you to win. Feedback from
friends is helpful, too, but I usually apply a bigger filter for that. Not all
of my friends are software developers, and while they all mean well, what they
want to tell you might be different from what they are saying. It's like they
are asking for faster horses but what they really want is a car.
Feedback on social media can be snarky at times; be prepared for that! Your job
is to find the grain of truth in every statement and focus on the productive
advice.

For example, take [this feedback](https://www.reddit.com/r/github/comments/kvvd3j/i_just_got_my_github_contribution_wall_art_from/gj1g015?utm_source=share&utm_medium=web2x&context=3) we got:


> how lazy can someone be to pay €36 for this.
    

You could turn it around to make it constructive:


> Can I get a version to print myself?
    

And that is some valuable feedback. We could provide a downloadable version in
the future.

**Lesson learned:**
It takes practice to extract actionable tasks from user feedback that fit your product vision.

## Summary

My hope is that I can encourage more people to launch side businesses. It's fun and rewarding to build something user-facing that you care deeply about.

Let me know if you found that post helpful. If you're looking for a unique way to decorate your home office, why not buy your own Github print on [codeprints](https://codeprints.dev)? ;)
