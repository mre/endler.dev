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
How does it interact with other parts of the codebase?
How does it affect the overall architecture?
Does it affect future planned work?
All of these questions are important to ask because code isn't written in isolation.
The role of more experienced developers is to reduce operational friction and handle risk management for the project.
The documentation, the tests, and the types are equally important as the code itself.

## Naming is everything

Names are so important because they encapsulate concepts and serve as the "building blocks" of your code.
They're even more important for languages with strong type systems, because they define how you can initialize things in your system.
When reviewing code, I spend the most time on naming.
Often, this is the most important part of a code review.
It's also the most subjective part, which makes it tedious because it's hard to distinguish between nitpicking and important naming decisions.

## Don't be afraid to say no

Sometimes you'll have to say no to a change.
It's important to be honest and direct.
Don't sugarcoat it or try to be nice.
Explain your reasoning and provide alternatives.
It's better to say no than to accept something that isn't right and will cause problems later on.
That's what the review process is for.
In open source, many people will contribute code that doesn't meet your standards.
There needs to be someone who says "no" and this is a very unpopular role (ask Linus Torvalds).
However, great projects need gatekeepers who are willing to say no, even though it's hard.
You can still be nice about it, but you need to be firm.

## Don't be a gatekeeper

Don't be the person who decides what's acceptable and what isn't.
That should be a team decision and covered by the code style guide.
Be open to new ideas and approaches by being objective and constructive.
That's a good idea in general, but especially in code reviews, where you're often dealing with subjective decisions.
Even though you'll develop an intuition for what to focus on in reviews, you should still base your reviews on facts and data, not on personal preferences.
On the other hand, sometimes people will say "let's just merge this and fix it later."
That's a slippery slope.
It can lead to technical debt and a lot of work later on.
It's hard to stand your ground, but it's important to do so.
If you see something that isn't right, speak up.
Typically, subtle issues point to deeper problems.

## Code Review is communication

It's not just about the code.
It's about the people who write it.
It's important to build a good relationship with the author.
Perhaps it's helpful to do the first couple of reviews together in a pair programming session.
This way, you can learn from each other's communication styles and preferences.
It's also a good way to get to know each other and build trust.
You can repeat that process later if you notice a communication breakdown or misunderstanding.

## Use multiple layers of review

Initially, focus on the bigger picture.
Once you're done with that, go into the details.
The expectation should be that you need multiple iterations to get the code right.
The goal shouldn't be to merge as quickly as possible, but to accept code that's high quality.
That's a mindset shift that's important to make.
Otherwise, what's the point of a code review in the first place?
It's not about pointing out flaws, it's about creating a shared understanding of the code within the team.
I often learn the most about writing better code by reviewing other people's code.
I've also gotten excellent feedback on my own code from excellent engineers.
These are "aha moments" that help you grow as a developer.
I think everybody should experience that.

## Don't be a jerk

From time to time, you'll disagree with the author.
It's important to be respectful and constructive.
Avoid personal attacks or condescending language.
Don't say "this is wrong."
Instead, say "I would do it this way."
If people resist, ask them why they did it that way.
Ask questions, which can lead to better designs.
Only add comments that you yourself would be happy to receive.

## If possible, try to run the code

It's very easy to miss things when you look at a lot of code for a long time.
I like to have a local copy of the code that I can play with.
I run the code, the tests, and the linters (if they're not already covered by CI).
I move things around, break things, and try to understand how it works.
After that, I revert the changes and, if needed, write down my findings in a comment.
It can lead to better understanding.
You can test user-facing changes like UI changes or error messages.
You might see constraints that weren't obvious from the code review.

## Don't be the bottleneck

Code reviews are a bottleneck in the development process.
Don't be the person who holds up the process.
If you can't review the code in a reasonable time, let the author know.
If you're not sure about something, ask for help.
If you don't have time to review the code, let the author know.
I'm still getting used to this, but I try to be more proactive about it.

## Never stop learning

Code reviews are my favorite way to learn new things.
I learn new techniques, patterns, and approaches.
I learn about new tooling and libraries.
I try to learn one new thing with each review.
It's not wasted time, because it helps the team improve and grow as a whole.

## Don't be nitpicky

Don't comment on whitespace changes.
You have linters for that.
Focus on the positive aspects: I like to add positive comments like "I like this" or "this is a great idea" from time to time.
It keeps the author motivated and shows that you appreciate their work.
Don't focus on the small stuff.
If you find yourself nitpicking, ask yourself if it's really important.
If it's not, let it go.
If it is, ask yourself if it's worth the time to fix it.
Typical examples are comments, which are often subjective, or stylistic decisions such as functional vs imperative code.

## Don't be a perfectionist

It's easy to develop your own standards and expect others to follow them.
That's not realistic and not helpful.
Instead, understand that people come from different backgrounds and have different experiences.
Adapt to their style and preferences to focus on helping them improve.

## Don't be afraid to ask stupid questions

If you don't understand something, ask.
It's better to ask than to assume.
Often, the author will be happy to explain their reasoning.
It can lead to a better understanding of the code and the system as a whole.
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