+++
title="Why I Still Believe in Mentorship"
date=2026-09-13
draft=false
[taxonomies]
tags=["dev", "culture", "rust"]
+++

One of the best tips I ever got was from my table tennis coach.
He watched me play and said, "You are leaning forward with the wrong foot!"
I'd been playing for years and thought I had a good stance.
I'm left-handed, and no one had told me that I should put my right foot forward.
I had copied the stance of other players without noticing the problem.

It was obvious once he pointed it out.
But until then, I hadn't thought to question it, and more practice hadn't helped me notice.
That single observation improved my game more than any amount of practice because it gave me better control over my forehand topspin.

Note that I didn't actively seek out advice on my stance.
Someone had to watch me play before either of us knew there was something to discuss.

## Mentorship in Software

This is part of why I still believe in mentorship, even now that an LLM can answer so many programming questions.

In software, we often work without that kind of support.
We learn systems design, architecture, testing, and refactoring largely by doing them.
Thoughtful code reviews help, but they're rare, and by the time a review happens, many design decisions have already been made.
The reviewer sees the end result but not the (sometimes flawed) reasoning that produced it.

Pair programming gets closer.
But two equally inexperienced programmers can reinforce each other's bad habits.

An AI agent can take over the keyboard instead of helping you think through the problem.
You may get better code out of the session without getting much better at writing it.
A session where it fixes everything can be productive, but being productive and learning are two different things entirely.

## The Question Behind the Question

I run a one-on-one [Rust mentorship program](https://corrode.dev/mentorship/), so I have a personal stake in this.
Most of the sessions start with a concrete question:

- Would you make this generic?
- Is it okay to clone here?
- How can I handle this error?

Often, answering the concrete question is beside the point.
We have to look at the thought process behind the question.

Before deciding whether something should be generic, for example, it helps to know what the programmer expects to vary and why.
Otherwise, we can spend the session discussing how to build an abstraction that might not be necessary.

A mentor has enough distance from the problem to question its framing and enough experience to recognize familiar mistakes.
They can also watch how you approach it.
They notice which details you leave out, which abstraction you often reach for, and how you deal with uncertainty.
These are things you might not think to mention when asking for help.

LLMs can question assumptions, too.
But I've found they usually work best when you already know what to ask.
The difficulty is that we often don't know which of our assumptions need challenging.
Knowing what to ask can matter more than knowing the answer, and it's hard to ask about something you haven't noticed.

## Mentoring in Other Fields

Nobody is surprised when a professional athlete has a coach.
Musicians keep taking lessons after decades of playing.
We don't take this as evidence that they haven't learned the basics.
They know a great deal, but they still benefit from someone who can observe them from the outside.

Experience doesn't remove that need in software either.
You can become an experienced developer while carrying habits you've never examined.
If those habits let you finish the work, you may have little reason to suspect them.
I could play table tennis with the wrong stance, too, just not as well.

The people I mentor are already experienced software engineers.
They are all capable of using LLMs in their work.
And yet, they've realized there's something missing that's holding them back.
They feel like they're not progressing as quickly as they could, and their companies haven't provided the mentorship they need.

## Learning Faster

Software gives us very uneven feedback.
A syntax error gets your attention immediately because the code won't compile.
But a poor architectural boundary can compile, pass the tests, get approved in review, and become a major problem months later when you lack the time to make changes.

One way to learn architecture is to make bad decisions and sit with their consequences.
That's how I learned.
The trouble is that it takes years, and it's certainly not motivating.

A mentor can streamline that process by asking questions you may not think to ask yet:

- Is this abstraction really necessary?
- How would an error propagate across the system?
- How can we test this?

There is no single correct answer to these questions.
The answers depend on the constraints and the stage of the project.
A mentor should help you examine those constraints and point out risks you've missed, while leaving the decision to you.
If someone else chooses the design, you lose the practice of choosing it yourself.

You also still have to write the code and live with all the consequences.
But you go in with a better understanding of what might go wrong.
And if it does, you have someone to help you work out why.
That is how you develop judgment you can use on the next project.
It's a bit like climbing with a partner.

## Does Everyone Need a Mentor?

If you're just starting out, a book, a course, or a friendly community might be better value.
If you need an answer to an isolated question, documentation or an LLM is faster and cheaper.
If mentorship were only about transferring information, it would be harder to make a case for it.

Personal mentorship becomes valuable when the potential payoff is a multiple of the investment.
That is typically the case in a professional setting, where focused mentorship can help you land a better job or switch to a more interesting project.

However, a mentor cannot manufacture curiosity.
As with going to the gym, paying for help doesn't spare you the exercise.
One hour of conversation cannot make up for a week without practice.
You have to try things between sessions if you want the next conversation to be different from the last.
I pick my mentees very carefully because I want to maximize the value of my own time as well as theirs.
If mentoring is not the right fit for them, I'll let them know.

Easier access to answers hasn't changed any of this.
You can use AI to examine a decision, or you can use it to reassure yourself that you've already made the right one.
The second use may feel better for a while, but it leaves you where you started.

What I want from mentorship is the kind of help my coach gave me: someone paying enough attention to notice what I couldn't see for myself.
Then I have to change how I play.

That's what I aim to offer in my [Rust mentorship](https://corrode.dev/mentorship/), at least: we work through real problems together, explore questions, and put humans first.
If I do a good job, my mentee will eventually surpass me, and I'd be proud to help them get there.
