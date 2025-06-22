+++
title="Repeat Yourself"
date=2025-06-22
draft=false
[taxonomies]
tags=["dev", "culture"]
+++

One of the most repeated pieces of advice throughout my career in software has been "don't repeat yourself" also known as the DRY principle.
For the longest time, I took that at face value, never questioning its validity.

That was until I saw actual experts write code: **they copy code all the time**.
I realized that repeating yourself has a few great benefits.


## Keeping Up The Momentum

When you're writing code, you want to keep the momentum going to get into a flow state.
If you stop to think about the perfect abstraction all the time, it's easy to lose momentum.

Instead, if you allow yourself to copy-paste code, you keep your train of thought going and work on the problem at hand.
Especially for repetitive code, it's often easier to copy existing code and modify it until it becomes too much of a burden -- at which point you can go and refactor it. 

I would argue that "writing mode" and "refactoring mode" are two different states of mind.
During writing mode, you want to focus on getting the idea down and stop your inner critic, which constantly tells you that your code sucks.
During refactoring mode, you take the role the critic and look for ways to improve the code by finding the right abstractions, removing duplication, and improving readability.

Keep these two modes separate.
Don't try to do both at the same time.

## Finding The Right Abstraction Is Hard

When you start to write code, you often don't know the right abstraction to use yet.
But if you copy code, you find that the right abstraction often reveals itself automatically:
It's just too annoying to copy the same code over and over again, so you start to look for ways to abstract it away. 
Typically, this happens after 3 or 4 copies of the same code for me.

Humans are really good at recognizing patterns, and once you have a few copies of the same code, you can see the commonalities and extract the right abstraction.

If you start too early, you might end up with a bad abstraction that doesn't fit the problem.
You know it because it feels clunky.

Some typical symptoms include: 

- Generic names that don't convey intent (e.g., `process_data` instead of `calculate_total_price`)
- Scope that's too broad or narrow (e.g., a generic "process" function that tries to do everything)
- Difficulty understanding without additional context
- Limited reusability. The abstraction is only used in one or two places
- Not flexible enough to accommodate future changes or requirements
- Tight coupling to implementation details 
- Poor testability

## Abstractions Require Careful Consideration 

It's easy to settle for the first abstraction that comes to mind, but most often, it's not the right one.
And reverting the *wrong* abstraction is often difficult, because now a lot of the logic depends on it.

We also get attached to abstractions because they represent effort and creativity.
This makes us reluctant to discard them even when they no longer fit the problem.
It's a sunken cost fallacy.

Once you introduce an abstraction, you typically have to work with it forever (or at least for a long time).
It gets worse when other programmers start to depend on it, too.
Then you have to be extra careful about changing it, because it might break other parts of the codebase.
If you had a copy of the code instead, you could just change it in one place without worrying about breaking anything else.


Better to wait until the *last moment* to define the abstraction, when you have a better understanding of the problem.

## The Cost of Abstraction

Abstraction is often touted as a way to reduce code duplication, but it comes with its own costs.
Abstractions can make code harder to read, understand, and maintain.
That is because you have to jump between multiple levels of indirection to understand what the code does.
The abstraction can live in a different file, modules, or even libraries or frameworks.
The cost of traversing these layers is not low**,** and we humans only have a limited context window.
An expert programmer might be able to keep a few levels of abstraction in their head, but most programmers will struggle pretty quickly.
(That also depends on the familiarity with the codebase, of course.)

When you copy code, you can keep it all in one place.
The code *is* the code, so you can just go and read it.

Whenever you introduce an abstraction, think about developers who might not be familiar with the codebase.

## Code That Looks Similar But Is Not

Sometimes, code looks similar but is not.
For example, you might have two pieces of code, which calculate a value based on floating point numbers,
but the context is totally different.

```python
# Calculate the sum of all items in a shopping cart 
for item in shopping_cart:
    total += item.price * item.quantity
```

Here's similar-looking code that's actually doing a completely different calculation:

```python
# Calculate the total memory usage of processes
for process in processes:
    total_memory += process.memory_usage * process.instance_count
```

In both cases, we iterate over a collection of items and calculate a total by multiplying some properties of the items.

You might be tempted to abstract this into a single function that takes a collection and a function to apply to each item, like this:

```python
def calculate_total(items, multiplier):
    return sum(multiplier(item) for item in items)
```

But wait a second: the two calculations are fundamentally different.

The first calculation is about financial calculations that require exact decimal precision and audit trails, while the second is about system monitoring where performance and real-time updates matter more than perfect accuracy.

If you tried to abstract these into a single function, you'd end up with a generic "multiply and sum" utility that obscures the important domain-specific considerations each calculation requires.

Often you'll find that different parts of the codebase evolve independently, and the context of each calculation is different:

```python
def calculate_total_price(shopping_cart):
    """
    Calculate the total price of items in a shopping cart.
    """
    # Early return for empty cart
    if not shopping_cart:
        raise ValueError("Shopping cart cannot be empty")
    # Quantity cannot be negative or zero
    if any(item.quantity <= 0 for item in shopping_cart):
        raise ValueError("Item quantity must be greater than zero")
    # Strong typing for item properties
    total: float = 0.0
    for item in shopping_cart:
        # Account for rounding errors in financial calculations
        total += round(item.price * item.quantity, 2)
    # Check for overflow
    if total > 1e6:
        raise OverflowError("Total price exceeds maximum limit")
    return total
```

This function is specific to the problem of calculating a total price in a shopping cart, with checks for empty carts, negative quantities, and rounding errors.
A generic abstraction would have hidden these important details.

In the case of the memory usage calculation, we might end up with something much simpler:

```python
def calculate_total_memory_usage(processes):
    """
    Calculate the total memory usage of processes.
    """
    return sum(process.memory_usage * process.instance_count for process in processes)
```

If we ended up applying "don't repeat yourself" too early, we would have lost the context and the specific requirements of each calculation.


> Duplication is far cheaper than the wrong abstraction
> -- [Sandy Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)

## DRY Can Introduce Complexity

The "Don't Repeat Yourself" (DRY) principle is often misinterpreted as a blanket rule to avoid any duplication at all costs.
However, this can lead to unnecessary complexity.
Complexity arises when code has too many branches (if-conditions), which can make it harder to understand all the possible paths through the code.
If you try to avoid repetition by introducing and abstractions, you suddenly have to deal with all the edge cases that come with it in a place far away from the actual business logic.
It is very hard to account for all the edge cases in that situation.
The consequence is that you end up adding redundant checks and conditions to the abstraction, just to make sure it works in all cases.
But later on, you might have forgotten the reasoning behind those checks.
However, you keep them around because you don't want to break any callers of the abstraction.
The result is dead code that does unnecessary checks and adds complexity to the codebase.
All because you wanted to avoid repeating yourself.

The common wisdom is that if you repeat yourself, you have to fix the same bug in multiple places.
But, ironically, the very reason why we avoid repeating ourselves can lead to more bugs.
When you create a shared abstraction, a bug in that abstraction affects *every* caller, potentially breaking multiple unrelated features at once.
With duplicated code, a bug is isolated to just one specific use case. You can fix it there without worrying about side effects elsewhere.
The "fix in multiple places" problem assumes the bug exists in all copies, but often it doesn't - each copy might have evolved differently and only some instances actually have the issue.
Knowing that you didn't break anything in a shared abstraction is much harder than checking a single copy of the code. 

## Clean Up Afterwards

The key to making this work is to clean up afterwards.
This can happen before you commit the code or during a code review.
At this stage, you can look at the code you copied and see if it still makes sense to keep it as is or if you can see the right abstraction.
I heavily refactor code once I have a better understanding of the problem, but not before.
This is a constant struggle, as I am always tempted to abstract too early, but I try to resist the urge.

Give yourself permission to remove abstractions that no longer fit the problem.
Go back to copy-pasted code to avoid the abstraction, then rethink the problem based on the new information you have.
Oftentimes, you'll find a better abstraction that fits the problem better.
The "inlining" step of copy-pasting code is crucial to this process.
For a while, you end up "repeating yourself" again in the codebase, but that's okay.
It gets worse before it gets better.

To quote Sany one more time:

> When the abstraction is wrong, the fastest way forward is back.
> -- [Sandy Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)

## Why People Love DRY 

Why is the DRY principle so prevalent in software development?

I think some of it has to do with hybris: avoiding repetition makes us feel clever.
"Look, I know all of these smart ways to avoid repetition! I know how to use interfaces, generics, higher-order functions, and inheritance to avoid repetition here."

But the truth is, no one cares.

Humans just want a simple solution to their problem and machines really don't care about copied code.
In fact, a lot of the abstractions get unrolled by the compiler anyway for better performance (e.g. to avoid the overhead of function calls).

The other reason is to avoid the "fix in multiple places" problem.
But as I explained above, this is a false assumption.
If you copy code, you can fix the bug in one place, and if it doesn't apply to all copies, you don't have to worry about it.
If you abstract it away, you have to worry about all the edge cases and potential side effects of the abstraction.
This can lead to more bugs and complexity than just copying the code in the first place.

## tl;dr

I realized, this was much about not repeating yourself as it was about the cost of wrong abstractions.
Perhaps these two concepts are strongly related.


Don't be afraid to copy code when it helps you keep momentum and find the right abstraction.

**It bears repeating: "Repeat yourself."**
 