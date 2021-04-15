+++
title="A Timelapse of Timelapse"
date=2020-02-04
[taxonomies]
tags=["oss"]
[extra]
social_img="timelapse_social.png"
excerpt="Timelapse is a little open-source screen recorder for macOS. It takes a screenshot every second and creates a movie in the end. To celebrate its unlikely 1.0 release today, I present here a timelapse of this project's journey. It just took ten years to get here."
+++

[Timelapse](https://github.com/mre/timelapse) is a little open-source screen
recorder for macOS. It takes a screenshot every second and creates a movie in
the end.

To celebrate its unlikely 1.0 release today, I present here a "timelapse" of
this project's journey. It just took _ten years_ to get here.

{{ video(url="https://www.youtube.com/embed/_QEmxAZqQhE", preview="timelapse.jpg") }}

## 2011 - How it all began

To be honest, I don't remember why I initially wrote the tool. I must have had a
personal need for a screen recorder, I guess...

In May 2011, when I started the project, I was doing my Masters Degree in
Computer Science. I might have needed the tool for University; most likely,
however, I was just trying to find an excuse for not working on an assignment.

During that time, I wrote a lot of tools like that. Mainly to scratch a personal
itch, learn a new programming language, or just have fun.

Among them are tools like a [random sandwich
generator](https://github.com/mre/ihatesubways) for Subway (the American
fast-food chain), [DrawRoom](https://github.com/mre/DrawRoom), a keyboard-driven
drawing app inspired by
[WriteRoom](http://www.hogbaysoftware.com/products/writeroom), and the
[obligatory CMS software](https://github.com/mre/Creamy), that I sold to
clients. Surprisingly, none of them were a great success.

{{ figure(src="drawroom.jpg", caption="DrawRoom, a tool that I wrote around the same time, is a real piece of art. To this day it has five commits and a single Github star (by myself, don't judge...).") }}

What I _do_ know for sure is that I was unhappy with all existing screen
recorders. They could roughly be categorized into these three groups:

- Proprietary solutions that cost money or could call home.
- Tools that didn't work on macOS.
- Small, fragile, one-off scripts that people passed around in forums or as
  Github gists. They rarely worked as advertised.

Among the remaining tools were none that provided any timelapse functionality;
so I set out to write my own.

This all sounds very epic, but in reality, I worked on it for a day. After five
heroic commits on May 11, 2011, it sat there, idle, for seven years...

## 2018

A lot of time elapsed before anything exciting happened.

In January '18, seemingly out of nowhere, the first user filed a bug report. It
was titled [hung when creating the
avi](https://github.com/mre/timelapse/issues/1) 😱. Turns out that a game
developer from Canada,
[juul1a](https://www.youtube.com/channel/UCs2DJ9xpGic1pQkWNMwAUHw), was trying
to use the tool to track her progress on an indie game &mdash; how cool is that?

To help her out, I decided to do some general cleanup, finally write down some
instructions on how to even use the program, add a `requirements.txt`, and [port
the tool from mencoder to
ffmpeg](https://github.com/mre/timelapse/commit/0b43515037670604143bf3b3eb06061ecfbbe108).

After that, timelapse was ready for prime-time. 🎬 Here is some live action from
her videos featuring timelapses:

{{ video(url="https://www.youtube.com/embed/vv2CCwEM8Ws", preview="preview.jpg") }}

At that point, the tool was still very wobbly and could only be used from the
commandline, but I began to see some potential for building a proper app from
it; I just never found the _time_.

In October '18, I decided to ask for support during
[Hacktoberfest](https://hacktoberfest.digitalocean.com/details/). I created a few
tickets and labeled them with `hacktoberfest` to try and find contributors.

And then, I waited.

First, [Shreya V Prabhu](https://github.com/ShreyaPrabhu) fixed an issue where a
new recording was overwriting the previous one by adding a [timestamp to the
video name](https://github.com/mre/timelapse/pull/3). Then [Abner
Campanha](https://github.com/abnerpc) and [Shane
Creedon](https://github.com/ShaneCreedon) created a basic test structure.
[Gbenro Selere](https://github.com/seleregb) added a CI pipeline for Travis CI.
It really worked, and the project was in much better shape after that!

## 2019

One year passes by, and [Kyle Jones](https://github.com/Kerl1310) adds some
contribution guidelines, while I move the CI pipeline to the newly released
Github actions.

[Chaitanya](https://github.com/cmangla) fixed a bug where the program would hang when
the recording stopped by [moving the video creation from threads to a separate
process](https://github.com/mre/timelapse/pull/24). He continued to make the
codebase more robust and became a core contributor, reviewing pull requests and
handling releases.

Thanks to [orcutt989](https://github.com/orcutt989), the app now made use of
[type hints in Python 3.6](https://github.com/mre/timelapse/pull/33).

[gkpln3](https://github.com/gkpln3) added support for multi-monitor
configurations. The screen captured will always be the one with the mouse on it.

## 2020

Fast forward to today, and after almost _ten years_, we finally created a true
macOS app using the awesome [py2app](https://github.com/ronaldoussoren/py2app)
bundler. This should make the tool usable by non-developers.

## Back to the Future

We reached the end of our little journey.

A long time has passed until 1.0. This project is a testament to the wonders of
open source collaboration, and I am proud to work on it with contributors from
around the world. It doesn't have to be a life-changing project to bring people
together who have fun building things. If this were the end of the story, I'd be
okay with that. I doubt it, though. Here's to the next ten years!

🎬 [Download timelapse on Github](https://github.com/mre/timelapse).

## Bonus

The video at the beginning is a timelapse of how I finish this article.  
How meta.
