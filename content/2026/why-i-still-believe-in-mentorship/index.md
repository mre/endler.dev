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
That single observation improved my game more than any amount of practice because it gave me better control over my forehand play.

Note that I didn't actively seek out advice on my stance.
Someone had to watch me play, observe, and then point out the single most helpful thing that would set me on the right path. 

## Mentorship in Software

This is part of why I still believe in mentorship, even now that an LLM can answer so many programming questions.

In software, we are often expected to struggle alone. 
We're supposed to learn systems design, architecture, testing, and refactoring largely by sitting with the problems. 
The times when I grew the most as a programmer was through thoughtful code reviews, but they are rare.
Besides, the reviewer sees the end result but not the (sometimes flawed) reasoning that produced it.

Pair programming gets closer.
But two equally inexperienced programmers can reinforce each other's bad habits.

An agent can control the keyboard instead of helping you reason through a problem. 
It may produce better code, but you're not getting much better yourself. 
A session where a machine fixes everything is productive, but being productive and growing as a programmer are two different things entirely. 

## Going beyond the superficial questions 

I run a one-on-one [Rust mentorship program](https://corrode.dev/mentorship/), so I have a personal stake in this.
Most of my mentees come with a concrete question:

- Would you make this generic?
- Is it okay to clone here?
- How can I handle this error?

Often, answering the concrete question is beside the point.
We have to look at the thought process that led to it. 

Before deciding whether something should be generic, for example, it helps to know what is expected to vary and why.
Otherwise, we can spend the a long time discussing how to build an abstraction that might unnecessary in the first place.

A mentor has enough distance from the problem to question its framing and enough experience to recognize familiar patterns.
They notice which details you leave out, which patterns you reach for, and which you ignore. 
These are things you might not think to mention when asking for help because you lack the vocabulary.

LLMs can question assumptions, too!
But I've found they usually work best within the realm of what you already know. 
The difficulty is that we often don't know which of our assumptions need challenging.
Knowing what to ask can matter more than knowing the answer, and it's hard to ask about something you haven't noticed.

## Mentoring in Other Fields

Nobody is surprised when a professional athlete has a coach.
Musicians keep taking lessons after decades of playing.
We don't take this as evidence that they haven't learned the basics.
Quite the contrary: it's an indication that they are serious about improving and that they've outgrown generic advice.
It requires introspection to recognize that you can benefit from someone who can observe you from the outside. 
And in some sense, you put yourself in a vulnerable position.
The wrong mentor can set you back, while the right one can dramatically accelerate your growth.

Experience doesn't remove the need for mentoring in software either.
You can become an experienced developer while still carrying counterproductive habits you've never examined.
If those habits let you finish the work, you may have little reason to suspect them and the problem gets worse because bad habits get reinforced.
I could play table tennis with the wrong stance, too, just worse. 

The people I mentor are *already* experienced software engineers.
They are perfectly capable of using LLMs in their work.
Many are in leading positions as staff or principal engineers.
And yet, they've realized there's something missing that's holding them back.
They feel like they're not progressing as quickly as they could, and their companies haven't provided the mentorship they need.
Besides, their day-job leaves little time for deliberate practice. 

## Learning Faster

Another problem is that software gives us very uneven feedback.
A syntax error gets your attention immediately because the code won't compile.
But a poor architectural decision can compile, pass the tests, get approved in review, and become a major problem months later when you lack the time to make changes.

One way to learn architecture is to make bad decisions and sit with their consequences.
That's how I learned!
The trouble is that it takes years, and it's certainly not motivating.

A mentor can streamline that process by asking questions you may not think to ask yet:

- Is this abstraction really necessary?
- How would an error propagate across the system?
- How can we test this?

There is no single "correct" answer to these questions.
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
That is typically the case in a professional setting, where focused mentorship can help you land a better job or switch to a different team with a more interesting project.

However, a mentor cannot manufacture curiosity.
As with going to the gym, paying for help doesn't spare you the exercise.
One hour of conversation cannot make up for a week without practice.
You have to try things between sessions if you want the next conversation to be different from the last.
I pick my mentees very carefully because I want to maximize the value of my own time as well as theirs.
If mentoring is not the right fit for them, I'll let them know.

Easier access to answers hasn't changed any of this.
You can use "AI" to examine a decision, or you can use it as an echo chamber to justify it. 
The second use may feel more rewarding in the moment, but it leaves you where you started.

What I want from mentorship is the kind of help my coach gave me: someone paying enough attention to notice what I couldn't see for myself.

That's what I aim to offer in my [Rust mentorship](https://corrode.dev/mentorship/), at least: we work through hard problems together, explore the design space, and make deliberate choices. 
If I do a good job, my mentee will eventually surpass me, and I'd be proud to help them get there.
