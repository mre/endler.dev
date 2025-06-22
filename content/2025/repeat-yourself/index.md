+++
title="Repeat Yourself"
date=2025-06-22
draft=false
[taxonomies]
tags=["dev", "culture"]
+++

One of the most repeated pieces of advice throughout my career in software has been "don't repeat yourself," also known as the DRY principle.
For the longest time, I took that at face value, never questioning its validity.

That was until I saw actual experts write code: **they copy code all the time**[^experts].
I realized that repeating yourself has a few great benefits.

[^experts]: For some examples, see [Ferris working on Rustendo64](https://www.youtube.com/watch?v=ToOt-osLxNk) or [tokiospliff working on a C++ game engine](https://www.youtube.com/watch?v=j79G5Be8Q4Y).

## Why People Love DRY 

Why is the DRY principle so prevalent in software development?

One reason is to avoid bugs.
The common wisdom is that if you repeat yourself, you have to fix the same bug in multiple places, but if you have a shared abstraction, you only have to fix it once.

I don't think this tells the whole story, though.
As we'll see abstractions can introduce bugs, too.

Another reason why we avoid any kind of repetition is that it makes us feel clever.
"Look, I know all of these smart ways to avoid repetition! I know how to use interfaces, generics, higher-order functions, and inheritance!"

Both reasons are misguided.
There are many benefits of repeating yourself.
Interestingly, they might get us closer to our goals in the long run.

## Keeping Up The Momentum

When you're writing code, you want to keep the momentum going to get into a flow state.
If you stop to think about the perfect abstraction all the time, it's easy to lose momentum.

Instead, if you allow yourself to copy-paste code, you keep your train of thought going and work on the problem at hand.
You don't introduce another problem of trying to find the right abstraction.

It's often easier to copy existing code and modify it until it becomes too much of a burden, at which point you can go and refactor it.

I would argue that "writing mode" and "refactoring mode" are two different modes of programming.
During writing mode, you want to focus on getting the idea down and stop your inner critic, which keeps telling you that your code sucks. 
During refactoring mode, you take the opposite role: that of the critic. You look for ways to improve the code by finding the right abstractions, removing duplication, and improving readability.

Keep these two modes separate.
Don't try to do both at the same time.[^1]

[^1]: This is also how I write text: I first write a draft and block my inner critic, and then I play the role of the editor/critic and "refactor" the text.
This way, I get the best of both worlds: a quick feedback loop which doesn't block my creativity, and a final product which is more polished and well-structured.


## Finding The Right Abstraction Is Hard

When you start to write code, you don't know the right abstraction just yet.
But if you copy code, you find that the right abstraction reveals itself; it's too tedious to copy the same code over and over again, at which point you start to look for ways to abstract it away.
For me, this happens typically after the first copy of the same code, but I try to resist the urge until the 2nd or 3rd copy.

If you start too early, you might end up with a bad abstraction that doesn't fit the problem.
You know it's wrong because it feels *clunky*.
Some typical symptoms include:

- Generic names that don't convey intent (e.g., `render_pdf_file` instead of `generate_invoice`)
- Difficulty understanding without additional context
- The abstraction is only used in one or two places
- Not flexible enough to accommodate future changes or requirements
- Tight coupling to implementation details
- Poor testability

## The Cost of Wrong Abstractions

It's easy to settle for the first abstraction that comes to mind, but most often, it's not the right one.
And removing the *wrong* abstraction is difficult, because now the data flow depends on it.

We also tend to fall in love with our own abstractions because they took time and effort to create.
This makes us reluctant to discard them even when they no longer fit the problem -- it's a sunk cost fallacy.

It gets worse when other programmers start to depend on it, too.
Then you have to be careful about changing it, because it might break other parts of the codebase.
Once you introduce an abstraction, you have to work with it for a long time, sometimes forever.

If you had a copy of the code instead, you could just change it in one place without worrying about breaking anything else.

> Duplication is far cheaper than the wrong abstraction  
> -- [Sandi Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)

Better to wait until the *last moment* to settle on the abstraction, when you have a solid understanding of the problem space.

## The Cost of Abstraction

Abstraction reduces code duplication, but it comes at a cost. 

Abstractions can make code harder to read, understand, and maintain because you have to jump between multiple levels of indirection to understand what the code does.
The abstraction might live in different files, modules, or even libraries or frameworks.

The cost of traversing these layers is high.
An expert programmer might be able to keep a few levels of abstraction in their head, but we all have a limited context window (which depends on the familiarity with the codebase).

When you copy code, you can keep all the logic in one place.
You can just go and read the whole thing and understand what it does. 

## Code That Looks Similar But Is Not

Sometimes, code *looks* similar but serves different purposes.

For example, consider two pieces of code that calculate a sum by iterating over a collection of items. 

```python
for item in shopping_cart:
    total += item.price * item.quantity

# Elsewhere...
for process in processes:
    total += process.memory_usage * process.instance_count
```

You might be tempted to abstract this into a single function:

```python
def calculate_total(items, multiplier):
    return sum(multiplier(item) for item in items)
```

Then the two calculations would look like this:

```python
price_multiplier = lambda item: item.price * item.quantity
total_price = calculate_total(shopping_cart, price_multiplier)

memory_multiplier = lambda process: process.memory_usage * process.instance_count
total_memory_usage = calculate_total(processes, memory_multiplier)
```

But the two calculations are different.
The first is about financial calculations that require exact decimal precision and audit trails, while the second is about system monitoring where performance and real-time updates matter more than perfect accuracy.

Different parts of the codebase evolve independently:

```python
def calculate_total_price(shopping_cart):
    """
    Calculate the total price of items in a shopping cart.
    """
    if not shopping_cart:
        raise ValueError("Shopping cart cannot be empty")
    
    total = 0.0
    for item in shopping_cart:
        # Round for financial precision
        total += round(item.price * item.quantity, 2)
    
    return total
```

This function is specific to calculating shopping cart totals, with checks for empty carts, negative quantities, and rounding errors.
A generic abstraction would have hidden these important domain-specific details.

In contrast, the memory usage calculation is much simpler:

```python
def calculate_total_memory_usage(processes):
    """
    Calculate the total memory usage of processes.
    Return 0 for empty process list (normal in monitoring)
    """
    return sum(process.memory_usage * process.instance_count for process in processes)
```

```python
def calculate_total_memory_usage(processes):
    """Calculate the total memory usage of processes."""
    return sum(process.memory_usage * process.instance_count for process in processes)
```

Had we applied "don't repeat yourself" too early, we would have lost the context and specific requirements of each calculation.

If you allow duplicated code to go through a few iterations, you might find that it starts looking quite different after a while. 

## DRY Can Introduce Complexity

The DRY principle is misinterpreted as a blanket rule to avoid any duplication at all costs.
However, this can lead to complexity.

When you try to avoid repetition by introducing abstractions, you have to deal with all the edge cases in a place far away from the actual business logic.
You end up adding redundant checks and conditions to the abstraction, just to make sure it works in all cases.
Later on, you might forget the reasoning behind those checks, but you keep them around because you don't want to break any callers.
The result is dead code that adds complexity to the codebase—all because you wanted to avoid repeating yourself.

The common wisdom is that if you repeat yourself, you have to fix the same bug in multiple places.
But the assumption is that the bug exists in all copies, which isn't true.
Each copy might have evolved and only some instances have the issue.
When you create a shared abstraction, a bug in that abstraction affects *every* caller, breaking multiple features at once.
With duplicated code, a bug is isolated to just one specific use case.

Knowing that you didn't break anything in a shared abstraction is much harder than checking a single copy of the code.

## Clean Up Afterwards

The key to making this work is to clean up afterwards.
This can happen before you commit the code or during a code review.
At this stage, you can look at the code you copied and see if it makes sense to keep it as is or if you can see the right abstraction.
I refactor code once I have a better understanding of the problem, but not before.
This is a struggle, as I am tempted to abstract too early, but I try to resist the urge.

Give yourself permission to remove abstractions that no longer fit the problem.
Go back to copy-pasted code, then rethink the problem based on the new information you have.
You'll find a better abstraction that fits the problem better.
The "inlining" step of copy-pasting code is crucial to this process.
For a while, you end up "repeating yourself" again in the codebase, but that's okay.
It gets worse before it gets better.

> When the abstraction is wrong, the fastest way forward is back.  
> -- [Sandi Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)

## tl;dr

I realized this was as much about not repeating yourself as it was about the cost of wrong abstractions.
These two concepts are related.

Don't be afraid to copy code when it helps you keep momentum and find the right abstraction.
It's fine to think about the right abstraction, but don't obsess over it.

**It bears repeating: "Repeat yourself."**