+++
title="Name-squatting on crates.io - Do we have a problem?"
date=2020-08-20
draft=true

#[extra]
#subtitle="Because \"Computer Etymology\" sounded boring."
#credits = [
#  {name = "Simon Brüggen", url="https://github.com/m3t0r" },
#  {name = "Jakub Sacha", url="https://github.com/jakubsacha" },
#]
#comments = [
#  {name = "lobste.rs", url="https://lobste.rs/s/7yhwfu/hacker_folklore"}
#]
+++

> Sorry, that name is already taken.

I get that a lot lately.

When I used Rust for the first time, I was surprised that its package manager,
crates.io, didn't support namespaces.
I always disliked that part about Python, because developers had to be "creative"
about naming things - which is a hard problem, as we know. ;)
Suddenly your logger wouldn't be called "logger" but "...".
Even worse, someone was using "logger" and published a sub-par or deprecated package there
and newcomers might use that by accident.

Using composer and PHP was always a breath of fresh air. Namespaces made these problems
go away.

## What is name squatting?

German people do reserve all the loungers.
It's become a trope:
https://www.youtube.com/watch?v=nzHihXOiNqk
If a German goes on vacation, they use a towel to mark their spot near the pool.
Some Germans get up reaaally early to place their towel for the day first thing in the morning
and then go about their day until they hit the pool.

This is how I picture name-squatters.

https://github.com/google/evcxr/blob/master/evcxr_jupyter/samples/evcxr_jupyter_tour.ipynb

Student projects take names
Talks take names (e.g. excuse crate)
Once a name is taken it can't be undone?

But namespaces would do the same

a dash is like a namespace
no convention (\_ or -)
typos can happen
people can still publish stuff under your "namespace"

https://github.com/google/evcxr

## How many names are squatted?

Squatted names by length

Short words in local macOS Unix dictionary

Biggest name-squatters by number of taken names

Common words and squatted names -> go through the list of most common english words and see which ones are squatted right now.

When were the names squatted?

Ratio of squatted vs available vs taken and useful

Last update time of packages

What is the situation for Python/NPM?
Npm has namespaces https://docs.npmjs.com/using-npm/scope.html
