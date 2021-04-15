+++
title="Name-squatting on crates.io - Do we have a problem?"
date=2020-08-20
draft=true
[taxonomies]
tags=["rust", "dev"]

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

When I started with Rust, I was surprised that its package manager,
crates.io, didn't support namespaces.
Python already taught me to dislike that behavior, because developers had to be "creative" with naming things &mdash; a hard problem, as we all know. ;)

Suddenly your logger wouldn't be called "logger" but oger, because that name happened to be free.
Even worse, someone was using "logger" and published a sub-par package there
and newcomers have to deal with that. And then it gets deprecated. And then you can [never use that name anymore](https://crates.io/users/jsgrant).

Using PHP's composer felt like a breath of fresh air in comparison.
Namespaces made these problems go away.

## What is name squatting?

Name squatting is like Germans reserving all the loungers near the pool.
It's become a meme: https://www.youtube.com/watch?v=nzHihXOiNqk
Some Germans get up reaaally early to place their towel before going for breakfast.

This is how I picture name-squatters.

https://github.com/google/evcxr/blob/master/evcxr_jupyter/samples/evcxr_jupyter_tour.ipynb

Some users are not as malicious. They just happen to take the good names out of convenience:

- A student needs a throwaway name for a university project? How about lecture?
- Talks take names (e.g. excuse crate)
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
