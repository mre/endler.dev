+++
title="How To Review Code"
date=2025-07-24
draft=false
[taxonomies]
tags=["dev", "code-review", "engineering"]
+++

I realized I've been reviewing code by other people for more than a decade now. I'm still far from being an expert, but I went through a bit of a "rite of passage" where my code reviews have changed. Nowadays, I spend around 50-70% of my time reviewing code in some form or another. It is what I get paid to do, next to systems design.

I focus on different things now than I did when I started. This blog post is a summary of what I learned over the years, ordered from most important to least important so you can get as much value as quickly as possible.

## Look at the bigger picture

Bad reviews are narrow in scope. Good reviews look at not only the changes, but also which problems the changes solve, which future issues might arise, and how they fit into the rest of the systems design. Look at the lines that *weren't* changed. Often, they tell the story.

## Watch the seams

How does this code fit into the rest of the system? How does it interact with other parts of the codebase? How does it affect the overall architecture? Does it affect future planned work? All of these questions are important to ask. That is because code is not written in isolation. The role of more experienced developers is to reduce operational friction and handle risk management for the project. The documentation, the tests, the types are equally important as the code itself.

## Naming is everything

Names are so important because they encapsulate concepts and they are the "building blocks" of your code. It's even more important for languages with a strong type system, because they define how you can initialize things in your system. When reviewing code, I spend the most time on naming. Often, this is the most important part of a code review. It is also the most subjective part, which makes it tedious because it is hard to distinguish between nitpicking and important naming decisions.

## Don't be afraid to say no

At times, you will have to say no to a change. It is important to be honest and direct. Don't sugarcoat it or try to be nice. Explain your reasoning and provide alternatives. It is better to say no than to accept something that is not right and will cause problems later on. That is what the review process is for. In open source, a lot of people will contribute code that is not up to your standards. There needs to be someone who says "no" and this is a very unpopular role (ask Linus Torvalds). However, great projects need gatekeepers who are willing to say no, even though it is hard. You can still be nice about it, but you need to be firm.

## Don't be a gatekeeper

Don't be the person who decides what is acceptable and what is not. That should be a team decision and covered by the code style guide. Be open to new ideas and approaches by being objective and constructive. That is a good idea in general, but especially in code reviews, where you are often dealing with subjective decisions. Even though you will develop an intuition for what to focus on in reviews, you still should base your reviews on facts and data, not on personal preferences. On the other hand sometimes, people will say "let's just merge this and fix it later". That's a slippery slope. It can lead to technical debt and a lot of work later on. It's hard to stand your ground, but it's important to do so. If you see something that is not right, speak up. Typically, subtle issues point at deeper problems.

## Code Review is communication

It is not just about the code, it is about the people who write it. It is important to build a good relationship with the author. Perhaps it's helpful to do the first couple of reviews together in a pair programming session. This way, you can learn from each other's communication styles and preferences. It is also a good way to get to know each other and build trust. You can repeat that process at a later point in time in case you notice a communication breakdown or a misunderstanding.

## Use multiple layers of review

Initially, focus on the bigger picture. Once you are done with that, go into the details. The expectation should be that you need multiple iterations to get the code right. The goal should not be to merge as quickly as possible, but to accept code that is of high quality. That is a mindset shift that is important to make because otherwise, what is the point of a code review in the first place? It is not about pointing out flaws, it's about a common understanding of the code in the team. I often learn the most about writing better code by reviewing other people's code. I also got a lot of excellent feedback on my own code by excellent engineers. These are "aha moments" that help you grow as a developer. I think everybody should experience that.

## Don't be a jerk

From time to time, you will disagree with the author. It is important to be respectful and constructive. Avoid personal attacks or condescending language. Don't say "this is wrong". Instead, say "I would do it this way". If people resist, ask them why they did it that way. Ask questions, which can lead to better designs. Only add comments that you yourself would be happy to receive.

## If possible, try to run the code

It is very easy to miss things when you look at a lot of code for a long time. I like to have a local copy of the code that I can play with. I run the code, the tests, and the linters (if not already covered by CI). I move things around, break things, and try to understand how it works. After that, I revert the changes and if needed, write down my findings in a comment. It can lead to better understanding. You can test "user-facing" changes like UI changes or error messages. You might see constraints that were not obvious from the code review.

## Don't be the bottleneck

Code reviews are a bottleneck in the development process. Don't be the person who holds up the process. If you can't review the code in a reasonable time, let the author know. If you are not sure about something, ask for help. If you don't have time to review the code, let the author know. I'm still getting used to this, but I try to be more proactive about it.

## Never stop learning

Code reviews are my favorite way to learn new things. I learn new techniques, patterns, and approaches. I learn about new tooling and libraries. I try to learn one new thing with each review. It's not wasted time, because it helps the team to improve and grow as a whole.

## Don't be nitpicky

Don't comment on whitespace changes: you have linters for that. Focus on the positive aspects: I like to add positive comments like "I like this" or "this is a great idea" from time to time. It keeps the author motivated and shows that you appreciate their work. Don't focus on the small stuff. If you find yourself nitpicking, ask yourself if it is really important. If it is not, let it go. If it is, ask yourself if it is worth the time to fix it. Typical examples are comments, which are often subjective or stylistic decisions such as functional vs imperative code.

## Don't be a perfectionist

It is easy to develop your own standards and expect others to follow them. That is not realistic and not helpful. Instead, understand that people come from different backgrounds and made different experiences. Adapt to their style and preferences to focus on helping them improve.

## Don't be afraid to ask stupid questions

If you don't understand something, ask. It is better to ask than to assume. Often, the author will be happy to explain their reasoning. It can lead to a better understanding of the code and the system as a whole. It can also help the author to see things from a different perspective. Perhaps they learn that their assumptions were wrong or that the system is not self-explanatory. Perhaps there's missing documentation.

## Ask for feedback on your review style

From time to time, ask the author for feedback on your review style. Did you help them? Did you point out the right things? Were you too nitpicky? Do they have suggestions for improvement? This way, you can improve your own review style and learn from others. To break that cycle, you can also ask for feedback on your code.