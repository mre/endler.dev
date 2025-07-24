+++
title="How To Review Code"
date=2025-07-24
draft=false
[taxonomies]
tags=["dev", "code-review", "engineering"]
+++

I've been reviewing other people's code for more than a decade now.
I'm still far from being an expert, but I went through a bit of a "rite of passage" where my code reviews have changed.
Nowadays, I spend around 50-70% of my time reviewing code in some form or another.
It's what I get paid to do, alongside systems design.

I focus on different things now than when I started.
This blog post is a summary of what I've learned over the years, ordered from most important to least important so you can get as much value as quickly as possible.

## Look at the bigger picture

Bad reviews are narrow in scope.
Good reviews look at not only the changes, but also what problems the changes solve, what future issues might arise, and how they fit into the rest of the system design.
Look at the lines that *weren't* changed.
They often tell the story.

## Watch the seams

How does this code fit into the rest of the system?
What's its interaction with other parts of the codebase?
How does it affect the overall architecture?
Does it impact future planned work?
All of these questions are important to ask because code isn't written in isolation.
The role of more experienced developers is to reduce operational friction and handle risk management for the project.
The documentation, the tests, and the types are equally important as the code itself.

## Naming is everything

Names are so important because they encapsulate concepts and serve as the "building blocks" of your code.
Strong type systems make them even more critical, because they define how you can initialize things in your system.
When reviewing code, I spend the most time on naming.
Often, this is the most important part of a code review.
It's also the most subjective part, which makes it tedious because it's hard to distinguish between nitpicking and important naming decisions.

## Don't be afraid to say no

Sometimes you'll have to say no to a change.
Being honest and direct is important.
Avoid sugarcoating it or trying to be nice.
Explain your reasoning and provide alternatives.
It's better to say no than to accept something that isn't right and will cause problems later on.
That's what the review process is for.
In open source, many people will contribute code that doesn't meet your standards.
There needs to be someone who says "no" and this is a very unpopular role (ask Linus Torvalds).
However, great projects need gatekeepers who are willing to say no, even though it's hard.
You can still be nice about it, but you need to be firm.

## Don't be a gatekeeper

Avoid being the person who decides what's acceptable and what isn't.
Team decisions and code style guides should cover that.
Stay open to new ideas and approaches by being objective and constructive.
That's a good idea in general, but especially in code reviews, where you're often dealing with subjective decisions.
Even though you'll develop an intuition for what to focus on in reviews, you should still base your reviews on facts and data, not on personal preferences.
On the other hand, sometimes people will say "let's just merge this and fix it later."
That's a slippery slope.
It can lead to technical debt and a lot of work later on.
It's hard to stand your ground, but it's important to do so.
If you see something that isn't right, speak up.
Typically, subtle issues point to deeper problems.

## Code Review is communication

Code reviews aren't just about the code.
The people who write it matter too.
Building a good relationship with the author is important.
Perhaps it's helpful to do the first couple of reviews together in a pair programming session.
This way, you can learn from each other's communication styles and preferences.
Building trust and getting to know each other works well this way.
You can repeat that process later if you notice a communication breakdown or misunderstanding.

## Use multiple layers of review

Start by focusing on the bigger picture.
Once you're done with that, go into the details.
Multiple iterations should be expected to get the code right.
The goal shouldn't be to merge as quickly as possible, but to accept code that's high quality.
That's a mindset shift that's important to make.
Otherwise, what's the point of a code review in the first place?
Reviews aren't about pointing out flaws, they're about creating a shared understanding of the code within the team.
I often learn the most about writing better code by reviewing other people's code.
I've also gotten excellent feedback on my own code from excellent engineers.
These are "aha moments" that help you grow as a developer.
I think everybody should experience that.

## Don't be a jerk

From time to time, you'll disagree with the author.
Being respectful and constructive is important.
Avoid personal attacks or condescending language.
Don't say "this is wrong."
Instead, say "I would do it this way."
If people resist, ask them why they did it that way.
Ask questions, which can lead to better designs.
Only add comments that you yourself would be happy to receive.

## If possible, try to run the code

Missing things becomes very easy when you look at a lot of code for a long time.
Having a local copy of the code that I can play with helps me a lot.
I run the code, the tests, and the linters (if they're not already covered by CI).
Moving things around, breaking things, and trying to understand how it works is part of my process.
After that, I revert the changes and, if needed, write down my findings in a comment.
Better understanding can come from this approach.
User-facing changes like UI changes or error messages become testable.
Constraints that weren't obvious from the code review might become visible.

## Don't be the bottleneck

Code reviews are a bottleneck in the development process.
Avoid being the person who holds up the process.
If you can't review the code in a reasonable time, let the author know.
Uncertainty about something? Ask for help.
No time to review the code? Let the author know.
I'm still getting used to this, but I try to be more proactive about it.

## Never stop learning

Code reviews are my favorite way to learn new things.
I learn new techniques, patterns, and approaches.
I learn about new tooling and libraries.
I try to learn one new thing with each review.
It's not wasted time, because it helps the team improve and grow as a whole.

## Don't be nitpicky

Whitespace changes don't deserve comments.
You have linters for that.
Focus on the positive aspects: I like to add positive comments like "I like this" or "this is a great idea" from time to time.
Keeping the author motivated and showing that you appreciate their work matters.
Avoid focusing on the small stuff.
If you find yourself nitpicking, ask yourself if it's really important.
If it's not, let it go.
If it is, ask yourself if it's worth the time to fix it.
Typical examples are comments, which are often subjective, or stylistic decisions such as functional vs imperative code.

## Don't be a perfectionist

Developing your own standards and expecting others to follow them is easy to do.
That's not realistic and not helpful.
Instead, understand that people come from different backgrounds and have different experiences.
Adapt to their style and preferences to focus on helping them improve.

## Don't be afraid to ask stupid questions

Not understanding something? Ask.
Asking is better than assuming.
Often, the author will be happy to explain their reasoning.
Better understanding of the code and the system as a whole can result from this.
It can also help the author see things from a different perspective.
Perhaps they'll learn that their assumptions were wrong or that the system isn't self-explanatory.
Perhaps there's missing documentation.

## Ask for feedback on your review style

From time to time, ask the author for feedback on your review style.
Did you help them?
Did you point out the right things?
Were you too nitpicky?
Do they have suggestions for improvement?
This way, you can improve your own review style and learn from others.
To break that cycle, you can also ask for feedback on your code.