+++
title="Why I Still Believe in Mentorship"
date=2026-09-11
draft=true
[taxonomies]
tags=["dev", "culture"]
+++

One of the best tips I ever got was from my table tennis coach.
He watched me play and suddenly said: "You are leaning forward with the wrong foot."
That was after I'd been playing for years and thinking I had a good stance.
I'm left-handed, and no one had ever told me that I should put my right foot forward.
It's such an obvious thing in hindsight, but I never noticed it myself as I emulated the stance of other players.
But this single observation improved my game more than any amount of practice.

That is what an outside observer can catch: practice alone can reinforce a habit you don't know is wrong.

**But in software, we're often on our own...**

Mentoring isn't something we can take for granted.

Instead, we often struggle alone with little guidance on systems design, architecture, testing, and refactoring.

Thoughtful code reviews are super helpful, but rare.
But by the time a review happens, many design decisions have already been made.

Pair programming helps, but it doesn't automatically provide mentorship.
You can pair with someone who is equally inexperienced and end up reinforcing each other's bad habits.
And someone more experienced might take over the keyboard rather than help you work through the problem yourself.

The same distinction applies to AI: a session where an agent fixes everything can be productive without teaching you much.
If you leave with a diff you cannot explain, the machine did the work for you, but you learned very little.

A mentor, instead, does not do the work for you; they listen and observe, ask questions, and help you notice the flaws in your mental model.
The goal is not to implement a feature, but to help you make solid decisions yourself and learn to recognize your blind spots.

Experience does not remove the need for this kind of feedback.
You can be an experienced developer and never notice your bad habits until someone points them out.
And that can take years or might not happen at all.

## The Question Behind the Question

I run a one-on-one [Rust mentorship program](https://corrode.dev/mentorship/).
Most of my mentoring sessions start with a concrete question:

- Should this be generic? 
- Is it okay to clone here?
- How do I handle this error?

Most of the time, the initial question is not the real problem.
The real problem is the mental model that led to the question in the first place.

Mentors are useful because they have enough distance from the problem to question its framing and enough experience to recognize familiar patterns.

A mentor can also watch how you approach the problem.
They notice when you reach for the wrong abstraction, avoid inconvenient questions, or fall back into bad habits.

Yes, LLMs can question assumptions, too, but I've found they usually work inside the frame you give them.
The difficulty is that we often do not know **which** of our assumptions are worth challenging.
In other words, knowing what to ask is the hard part; it's more important than knowing the answer. 

## Coaching Is Everywhere

Nobody is surprised when a professional athlete has a coach (quite the contrary).
Musicians keep taking lessons even after decades of playing.

These professionals don't need help with the basics.
They keep learning from others because they know **it is hard to observe yourself from the outside**.

## Learning Faster

Syntax has a quick feedback loop: your code simply won't compile.

Architecture is different.
A poor boundary can compile and pass every test, and it often gets rubber-stamped during review.
You might only discover the problem months later.

So how do you learn how to design robust systems?

One way is by **making bad decisions and living with their consequences.**
That's how I learned. 
The trouble is that this feedback loop takes years and it's not very pleasant.

A mentor can shorten it by asking questions you may not think to ask *just yet*:

- Is this abstraction really necessary?
- How would an error propagate across the system?
- How can we test this?

The answers depend on the constraints and the stage of the project.
A mentor should challenge your design and point out risks you missed, not tell you what to do.
You *still* have to write code, make the decision, and live with the consequences yourself,
but at least you don't go in blind, and the mentor has got your back if your decision turns out to be wrong.

That is how you develop good judgment.

## Does Everyone Need a Mentor?

If you are just starting out, a book, a course, or a friendly community might be better value.
If you only need an answer to an isolated question, documentation or an LLM is probably faster and cheaper.
If mentorship were only about transferring information, it'd be harder to make a case for it. But it isn't!

Mentorship becomes useful when you really want to become excellent at something and generic advice stops being useful.
It makes sense when you feel stuck.
You know enough to do the work, but you feel like you are missing something.
That is where a mentor can save a lot of time if you're willing to apply the feedback and do the work yourself.

But a mentor cannot manufacture curiosity.
As with hitting the gym regularly, you have to put in the work yourself.
One hour of conversation cannot make up for a week without practice.
No amount of mentoring can make up for a lack of motivation.

A good mentor should be trying to put themselves out of a job.
The goal is to build mental models that help you make the next decision with less help.
If you still depend on the mentor in the same way months later, something has gone wrong.
Over time, the set of questions you ask should change.

The principles behind mentoring haven't changed just because answers are now easier to get.
Getting an answer isn't the same as having your thinking challenged.
If you only use AI to validate your design decisions, it's easy to build your own echo chamber.
But progress comes from churn.
You have to get your hands dirty to learn the soil.

Like a good teacher, a mentor wants their mentee to surpass them.
I've found that the best way to do that is by working through real problems together, asking the right questions, and leaving the decisions in the mentee's hands.

That's what I do in my [Rust mentorship](https://corrode.dev/mentorship/), at least.