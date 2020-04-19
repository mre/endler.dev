+++
title="Modern Day Annoyances - Digital Clocks"
date=2017-11-07

[extra]
social_img="2017_digital_clocks.png"
+++

This morning I woke up to the beeping noise of our oven's alarm clock.
The reason was that I tried to correct the oven's local time the day before &mdash; and I pushed the wrong buttons.
As a result I didn't set the correct time, instead, I set a cooking timer... and that's what woke me up today.

<!-- more -->

{{ figure(src="./kitchen.svg") }}

## Let's add a clock to the microwave!

On occasions like these, I wonder why there's a digital clock on every single household device these days.
They're integrated into microwaves, fridges, ovens, dishwashers, dryers, mixers &mdash; and that's just the kitchen!

There is an inflation of digital clocks on modern-day devices.
A lot of times I was wondering why that is the case. Here's my best guess:

_It's easier to add a useless digital clock to the design than to leave it out._

Say you are the engineer responsible for the control panel of a run-of-the-mill microwave.
The microwave chip comes with a digital timer, which is perfect for showing the remaining time until the food is warmed up.
Now the question is, what will the timer show when you don't want to heat anything?

Well, why not show the current time?
It's unobtrusive and adds value.

Except that these digital clocks can be quite annoying:

- They run out of sync and show the wrong time.
- They get reset when being plugged off or there's a power outage. (That's the dreaded, blinking `00:00` we all learned to love.)
- They don't automatically switch between summer and winter time (hey Germany!).

That's why I constantly need to look after those clocks.

Let me tell you a secret:
When I'm not warming stuff in the oven, I don't want it to tell me the local time. I want the stove to be _off_.

## Why I have trouble setting the clock on our oven

Our oven has three buttons related to time: plus, minus and a clock symbol.
To set the time, you push the clock symbol. An arrow appears and the display changes to 00:00. You press time again and another arrow appears.
Pressing it two more times shows a blinking clock symbol. Then you can use the + and - buttons to adjust the time. After that, you wait to confirm.
Easy!

The problem is, there is no immediate relationship between the controls and the result in the world.
The underlying concept is called _mapping_ and is prevalent in [interface design](<https://en.wikipedia.org/wiki/Natural_mapping_(interface_design)>).

To add some functionality to a device you have two options:

1. Add more buttons.
2. Teach an existing button a new trick.

Option 1 might dilute your beautiful design, while option 2 might mean frustration for your users.
Neither option is appealing.

Our oven _maps_ multiple functions to the same button.
But the most annoying thing is, that each device has _a different mapping_.
Learning to set the time on my oven won't help me with the dishwasher, which sports an entirely different interface!

## Takeaways

**Good industrial designs are few and far between.**

A clock on your product will most likely not add any additional value.
In the best case it might be an annoyance, in the worst case it's harmfully misleading.

When given a choice, I prefer home appliances without clocks.
Looking at today's market, that's harder than it sounds.
Arguably, a device with a clock is cheaper than one without; just because the ones with timers get produced more often.

Now I can understand why [it took Steve Jobs two weeks to decide on a washing machine](https://amzn.to/2AqQFZz):

> We spent some time in our family talking about what's the trade-off we want to make.
> We spent about two weeks talking about this. Every night at the dinner table.

He chose a Miele Washing machine in the end - without a digital clock, I assume.
