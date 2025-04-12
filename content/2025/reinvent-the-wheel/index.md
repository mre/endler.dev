+++
title="Reinvent the Wheel"
date=2025-04-12
draft=false
[taxonomies]
tags=["dev", "culture"]
+++
 
One of the most dangerous pieces of advice given to engineers is to not reinvent the wheel. 

The advice probably comes from a good place, but is typically given by two groups of people: 
- those who tried to invent a wheel themselves and know how hard it is
- those who never tried to invent a wheel and blindly follow the advice

Either way, both positions lead to a climate where curiosity and exploration gets discouraged.
I'm glad that some people didn't follow that advice for we owe them many of the conveniences of modern life.
We have much better wheels today than 4500–3300 BCE when the first wheel was invented.

It was also *crucially* important that wheels got reinvented throughout civilizations and cultures.

{% info() %}

**Note:** I would guess that most readers are programmers. It should be clear
that when I say "wheel" throughout this post, you can replace it with whatever
tool, protocol, service, technology, or other invention you're personally
interested in. 

{% end %}
 
I think people should reinvent wheels more often.

## Inventing Wheels Is Learning 

When in school I ran into some trouble, because I could never bring myself to stop asking "why"?
Especially my first math classes gave me a severe lack of context.
I would ask seemingly trivial questions: 

- Why is it called `x` and not `a`?
- Who invented the equal sign? 
- Where does that formula suddenly come from? 
- Why do we call it a "square"? 

Other students in class would seemingly not second-guess the teacher and had a much easier time making progress.
I wondered why and thought something was wrong with me to ask these questions.
Only later I found out that most people don't think too often about seemingly "simple" things.
For me, that's a key aspect of learning!
Some people learn best from first principles.

Anyhow...

To *really* understand something on a fundamental level, you have to implement a toy version first. 
It doesn't matter if it's any good; you can throw it away later.
In Computer Science, for example, there are many concepts that are commonly understood to be beyond the abilities of mere mortals:
databases, cryptography, and monads come to mind.

More people should know how caches, version control, or web servers work.

## Reinvent Simple Things Yourself

Too often, fundamental things are taken for granted. 
For example "strings" and "paths" are super tricky concepts in programming.
There is no "one right string."
To understand that, you have to run a lot of simple experiments and get a good intuition for what's going on.

I think it's a great exercise to implement a path library in your strongest language. Even if nobody ends up using it, I bet you'll learn a lot about paths. 
Similarly, I think every programmer should at least write one parser from scratch in their life.
A parser for what? It doesn't matter; maybe a CSV parser. 
These are not easy tasks. There are dozens, sometimes hundreds of footguns with every toy problem. 

It will teach you a few things:
- There is an infinite complexity in everyday things. 
- Humans like you created these abstractions. They are not absolute truths and there are usually multiple ways to solve a problem.
- You become more humble. The code you depend on on a daily basis was once written by humans like you who tried their very best. Building something that even a single other person finds useful is not easy. 

Everything is a tradeoff.
You can just decide which tradeoffs you make, but make them you will. 

What do I mean by tradeoff? Here are a few examples: 
* Correctness 
* Speed 
* Simplicity
* Scalability
* Functionality 
* Portability 
* Resource usage (Memory usage, compile time, etc.)

Your code can be great in some of these things, but not all of them and not for all users.

Which tradeoffs are **you** willing to make?

Going down rabbit holes is fun in its own way, but there is one other benefit:
It is one of the few ways to level up as a programmer... but only if you don't give up before you end up with a working version of what you tried to explore.
If you jump between projects too often, you will learn nothing.

## Reasons for Reinventing the Wheel

There are many great reasons to reinvent the wheel: 

* Build a better wheel (for some definition of better)
* Learn how wheels are made 
* Teach others about wheels
* Appreciate wheels more 
* Appreciate the inventors of wheels
* Learn a tiny slice of what it means to build a larger system (such as a vehicle) 
* Be able to change wheels or fix them when they break
* Learn the tools needed to make wheels along the way
* Help someone in need of a very special wheel. Maybe for a wheelchair?

Who knows? The wheel you come up with might not be the best use for a car, but maybe for a... skateboard or a bike?
Or you fail building a nicer wheel, but you come up with a better way to test wheels along the way.

Heck, the wheel you come up with might not even be used for transportation at all! 
It might be a potter's wheel, "a machine used in the shaping (known as throwing) of clay into round ceramic ware" [according to Wikipedia](https://en.wikipedia.org/wiki/Wheel).
You might end up building a totally different kind of wheel like a steering wheel or a flywheel.

Entire careers are made of people inventing wheels.
We have different names for them: "scientists", "entrepreneurs", "engineers", "inventors", or "hackers", to name a few.
We need more people who are bold enough to try to reinvent the wheel.

Of course, don't disregard the works of others -- study their work, but if you never tried to put your 
knowledge to the test, how would you ever know enough about your field to advance it?
How can you ever become an expert in anything if you don't start?

So, with all of the above, let's finally rephrase the rule:

**PLEASE DO reinvent the wheel unless you need a robust production-ready wheel today. In that case, just buy one.**
