+++
title="Repeat Yourself"
date=2025-06-23
updated=2025-06-24
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

Another reason why we avoid repetition is that it makes us feel clever.
"Look, I know all of these smart ways to avoid repetition! I know how to use interfaces, generics, higher-order functions, and inheritance!"

Both reasons are misguided.
There are many benefits of repeating yourself that might get us closer to our goals in the long run.

## Keeping Up The Momentum

When you're writing code, you want to keep the momentum going to get into a flow state.
If you stop to think about the perfect abstraction all the time, it's easy to lose momentum.

Instead, if you allow yourself to copy-paste code, you keep your train of thought going and work on the problem at hand.
You don't introduce another problem of trying to find the right abstraction.

It's often easier to copy existing code and modify it until it becomes too much of a burden, at which point you can go and refactor it.

I would argue that "writing mode" and "refactoring mode" are two different modes of programming.
During writing mode, you want to focus on getting the idea down and stop your inner critic, which keeps telling you that your code sucks.
During refactoring mode, you take the opposite role: that of the critic.
You look for ways to improve the code by finding the right abstractions, removing duplication, and improving readability.

Keep these two modes separate.
Don't try to do both at the same time.[^1]

[^1]: This is also how I write prose: I first write a draft and block my inner critic, and then I play the role of the editor/critic and "refactor" the text.
This way, I get the best of both worlds: a quick feedback loop which doesn't block my creativity, and a final product which is more polished and well-structured.
Of course, I did not invent this approach. I recommend reading "Shitty first drafts" from Anne Lamott's book [Bird by Bird: Instructions on Writing and Life](https://canongate.co.uk/books/3055-bird-by-bird-instructions-on-writing-and-life/) if you want to learn more about this technique. 

## Finding The Right Abstraction Is Hard

When you start to write code, you don't know the right abstraction just yet.
But if you copy code, the right abstraction reveals itself; it's too tedious to copy the same code over and over again, at which point you start to look for ways to abstract it away.
For me, this typically happens after the first copy of the same code, but I try to resist the urge until the 2nd or 3rd copy.

If you start too early, you might end up with a bad abstraction that doesn't fit the problem.
You know it's wrong because it feels *clunky*.
Some typical symptoms include:

- Generic names that don't convey intent (e.g., `render_pdf_file` instead of `generate_invoice`)
- Difficulty understanding without additional context
- The abstraction is only used in one or two places
- Too rigid for future changes
- Tight coupling to implementation details
- Poor testability

## It's Hard To Get Rid Of Wrong Abstractions 

We easily settle for the first abstraction that comes to mind, but most often, it's not the right one.
And removing the *wrong* abstraction is hard, because now the data flow depends on it.

We also tend to fall in love with our own abstractions because they took time and effort to create.
This makes us reluctant to discard them even when they no longer fit the problem—it's a sunk cost fallacy.

It gets worse when other programmers start to depend on it, too.
Then you have to be careful about changing it, because it might break other parts of the codebase.
Once you introduce an abstraction, you have to work with it for a long time, sometimes forever.

If you had a copy of the code instead, you could just change it in one place without worrying about breaking anything else.

<div>
  <blockquote cite="https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction">
    <p>
      Duplication is far cheaper than the wrong abstraction
    </p>
  </blockquote>
  <p>—<cite><a href="https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction">Sandi Metz</a></cite></p>
</div>

Better to wait until the *last moment* to settle on the abstraction, when you have a solid understanding of the problem space.

## The Mental Overhead of Abstractions

Abstraction reduces code duplication, but it comes at a cost.

Abstractions can make code harder to read, understand, and maintain because you have to jump between multiple levels of indirection to understand what the code does.
The abstraction might live in different files, modules, or libraries.

The cost of traversing these layers is high.
An expert programmer might be able to keep a few levels of abstraction in their head, but we all have a limited context window (which depends on familiarity with the codebase).

When you copy code, you can keep all the logic in one place.
You can just read the whole thing and understand what it does.

## Resist The Urge Of Premature Abstraction 

Sometimes, code *looks* similar but serves different purposes.

For example, consider two pieces of code that calculate a sum by iterating over a collection of items.

```python
total = 0
for item in shopping_cart:
    total += item.price * item.quantity
```

And elsewhere in the code, we have

```python
total = 0
for item in package_items:
    total += item.weight * item.rate
```

In both cases, we iterate over a collection and calculate a total.
You might be tempted to introduce a helper function, but the two calculations are very different.

After a few iterations, these two pieces of code might evolve in different directions: 

```python
def calculate_total_price(shopping_cart):
    if not shopping_cart:
        raise ValueError("Shopping cart cannot be empty")
    
    total = 0.0
    for item in shopping_cart:
        # Round for financial precision
        total += round(item.price * item.quantity, 2)
    
    return total
```

In contrast, the shipping cost calculation might look like this: 

```python
def calculate_shipping_cost(package_items, destination_zone):
    # Use higher of actual weight vs dimensional weight
    total_weight = sum(item.weight for item in package_items)
    total_volume = sum(item.length * item.width * item.height for item in package_items)
    dimensional_weight = total_volume / 5000  # FedEx formula
    
    billable_weight = max(total_weight, dimensional_weight)
    return billable_weight * shipping_rates[destination_zone]
```

If you allow duplicated code to go through a few iterations, you might find that it starts looking quite different after a while.

Had we applied "don't repeat yourself" too early, we would have lost the context and specific requirements of each calculation.

## DRY Can Introduce Complexity

The DRY principle is misinterpreted as a blanket rule to avoid any duplication at all costs.
However, this can lead to complexity.

When you try to avoid repetition by introducing abstractions, you have to deal with all the edge cases in a place far away from the actual business logic.
You end up adding redundant checks and conditions to the abstraction, just to make sure it works in all cases.
Later on, you might forget the reasoning behind those checks, but you keep them around "just in case" because you don't want to break any callers.
The result is dead code that adds complexity to the codebase—all because you wanted to avoid repeating yourself.

The common wisdom is that if you repeat yourself, you have to fix the same bug in multiple places.
But the assumption is that the bug exists in all copies.
However, each copy might have evolved and only some instances have the issue.

When you create a shared abstraction, a bug in that abstraction breaks *every* caller, breaking multiple features at once.
With duplicated code, a bug is isolated to just one specific use case.

## Clean Up Afterwards

Knowing that you didn't break anything in a shared abstraction is much harder than checking a single copy of the code.
Of course, if you have a lot of copies, there is a risk of forgetting to fix all of them.

The key to making this work is to clean up afterwards.
This can happen before you commit the code or during a code review.

At this stage, you can look at the code you copied and see if it makes sense to keep it as is or if you can see the right abstraction.
I try to refactor code once I have a better understanding of the problem, but not before.

Give yourself permission to remove abstractions that no longer fit the problem.
Go back to copy-pasted code, then rethink the problem based on the new information you have.

A trick to undo a bad abstraction is to inline the code back into the places where it was used.
For a while, you end up "repeating yourself" again in the codebase, but that's okay.
Often you'll find a better abstraction that fits the problem better.

<div>
  <blockquote cite="https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction">
    <p>
      When the abstraction is wrong, the fastest way forward is back.
    </p>
  </blockquote>
  <p>—<cite><a href="https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction">Sandi Metz</a></cite></p>
</div>

## tl;dr

It's fine to look for the right abstraction, but don't obsess over it.
Don't be afraid to copy code when it helps you keep momentum and find the right abstraction.

**It bears repeating: "Repeat yourself."**