+++
title="How Does `sleep` Work?"
date=2021-06-02
draft=true
[taxonomies]
tags=["dev", "rust"]
[extra]
credits = [
  {name = "Simon Brüggen", url="https://github.com/m3t0r" },
]
+++

Brain Sleep meme
"How does sleep work?*"
*The Unix command

Admittedly I got something better to do right now (sleeping) BUT [I have a good thing going](https://www.youtube.com/watch?v=1zTbVRPh5EI) with a new article
yesterday so why not use the momentum to learn about `sleep` (the Unix command).

I mean, everyone has a solid grasp on how it works, right?

```sh
❯❯❯ sleep 1
❯❯❯
```

Exactly one second passes.

## Did exactly one second pass!?

Probably? I don't care.

## Why should I care?

If you write a shell script then you probably shouldn't care!
Unless your program depends on precise timing.

A typical everyday example is ✨ [sleep sort](https://rosettacode.org/wiki/Sorting_algorithms/Sleep_sort#Bash) ✨

```sh
function sleep_and_echo {
  sleep "$1"
  echo "$1"
}

for val in "$@"; do
  sleep_and_echo "$val" &
done

wait
```

```sh
❯❯❯ ./sleep_sort.sh 2 1 4 3
1
2
3
4
```

Great!

But wait a sec...

```sh
❯❯❯ ./sleep_sort.sh 1.00000002 1.00000001
1.00000002
1.00000001
```

Uh oh.

If you say that this is ridiculous because no one should be depending on such accurate timings in a shell script, **you're correct**!
Let's just say it's fun to test the limits okay?

## How long does sleep 1 take?

```sh
time sleep 1
sleep 1  0.00s user 0.00s system 0% cpu 1.007 total
```

Hold on! So both the user time _and_ the system time is 0, but the total time is 1.007 seconds!?

[Here's refresher on the the output](https://stackoverflow.com/a/556411/270334):

- User is the amount of CPU time spent in user-mode code (outside the kernel)
- System is the amount of CPU time spent in the kernel
- Real is wall clock time - time from start to finish of the call. This is all
  elapsed time including time slices used by other processes and **time the
  process spends blocked (for example if it is waiting for I/O to complete)**.

{% info() %}
💡 `sleep` is blocked on I/O
{% end %}

Okay, but what does that even mean?

```
ps ax -p 39829 | grep sleep                       ✘ 
39829 s011  S      0:00.00 sleep 1000
```

## How does it work?

## How does it really work?

## How does it really really work?
