+++
title="The Dying Web"
date=2024-08-08
draft=false
[taxonomies]
tags=["culture"]
+++

I look left and right and I'm the only one who still uses Firefox.

{{ figure(src="travolta.gif") }}

At conferences and in coworking spaces it's always the same image: people using some distribution of Chrome.
Sometimes it's called Brave, sometimes Chromium, most of the time it's just Google Chrome.

I find that hilariously appalling.

An entire generation grew up with access to great free tools and open standards, which helped them jumpstart their career and 
gave them access to excellent technology for free.

Now, the world's largest websites by the same company, which also owns the world's most popular browser,
search engine. Coincidentally they are also the world's largest advertising company.
And people are wondering why they can't block ads on YouTube anymore.

We gave it all away for nothing.

Let me be the first to admit that I too am not without sin.
There was a weak period 15 years ago where browser performance became so unbearable on anything other than Chrome,
that it forced my hand to make the switch.
And yes, for a while, life was good and websites loaded quickly.

Reluctantly, I made the switch back to Firefox after a while, because open standards and privacy were
more important than a few milliseconds of loading time.
I could still understand why people would use Chrome, but I was happy with my choice.

Then [Firefox Quantum](https://blog.mozilla.org/en/mozilla/introducing-firefox-quantum/) came around and I 
told all my fellow developer friends about it.
To me, it was the best browser on the market, and I was proud to be a Firefox user again.
It was fast, snappy, and had a great add-on ecosystem.

To my surprise, nobody cared.

## Bad Habits Die Hard

Maybe people stayed with Chrome out of habit.

Performance and privacy aside, I just don't know how people can cope with Chrome's limited customizability.
It's hilarious to watch people with 200 tabs named "G", "Y", or "X" struggle to find that one document they opened a week ago.

In comparison, vertical tabs  on Firefox with addon-ons like [Sidebery](https://addons.mozilla.org/en-US/firefox/addon/sidebery/)
will make Chrome look like a toy.

Anyhow, Chrome.

There was a time when I tried to educate people on the negative effects of browser monoculture.
Okay, my mum didn't get it, but I was more disappointed by my fellow devs.
Everyone went the easy route and happily stayed on Uncle Google's lap.

At this point I neither have the willpower nor the energy to fight back;
It's hopeless. Probably it's easier to get blood from a stone
than to convince someone to switch back to Firefox.

{{ figure(src="marketshare.png") }}

## Nobody Forces You to Use Chrome

True, but the issues don't stop in front of my lawn, though.
As an outsider, I need to live with the consequences of browser monoculture every day.

Quite a few websites are unusable by now, because they got "optimized for Chrome."
[Microsoft Teams](https://github.com/webcompat/web-bugs/issues/25070#issuecomment-460721700), for example,
and [the list is long](https://github.com/webcompat/web-bugs/issues?q=is%3Aopen+is%3Aissue+label%3Abrowser-firefox).
These websites fail without reason.

There are positive examples, too.
[Zencastr](https://zencastr.com/), for example, used to be broken on Firefox, but they fixed it. 

I also use Chrome for online-calls, because tools like [Jitsi](https://meet.jit.si/) don't work well on Firefox.
Maybe it's because of Firefox' WebRTC support? Or, [maybe it's because of Chrome](https://blog.mozilla.org/webrtc/):

> **Pop Quiz**: If a website wants to play out of different speakers on your system, what permission must it have?
>
> 1. Speaker-selection permission
> 2. Microphone permission
>
>If you answered 2 then chances are you know your WebRTC stuff well, but you’re probably on a Chromium browser.

## How could Google get free reign?

Because everyone and their car stopped testing their stuff anywhere else.
If everyone tweaks their site for Chrome, whelp, of course the site will work just fine on Chrome!
We find ways around Chrome's weird kinks.
More users join the cult because stuff "just works" and the vicious cycle continues.
I can't blame them. It's easier to ride a horse in the direction it is going.

## But at what cost?

\*Elrond voice\*: We've been there two decades ago. (Okay, I was there.)
We called it the *Browser Wars*: Netscape vs Internet Explorer. Netscape lost and Microsoft ruled over the web with their ironclad fist. It wasn't fun.
We had more hacks around browser limitations than actual website functionality. Parents brought their kids through college by working around browser bugs for money.

Microsoft tried *really* hard to make life as miserable as possible for everybody:

> Internet Explorer has introduced an array of proprietary extensions to many of the standards, including HTML, CSS, and the DOM. This has resulted in several web pages that appear broken in standards-compliant web browsers and has introduced the need for a "quirks mode" to allow for rendering improper elements meant for Internet Explorer in these other browsers. &mdash; [Wikipedia](https://en.wikipedia.org/wiki/Internet_Explorer)

Essentially, they broke the web and we all warmed our hands on the dumpster fire.
All we got in return was quirks mode.

Google is smarter! They break the web, too, but they make you stand inside the fire.

## Why should I care a about a browser? They are all the same these anyways.

...says the developer who gets [tracked by Google](https://www.forbes.com/sites/zakdoffman/2024/06/16/google-chrome-tracking-on-windows-android-iphone-for-200-more-days/) 
every second of their waking life.

You see, Chrome is reeeeally good at marketing.
They say all the right things: We're fast! We're open source! We have the latest features!
What they don't tell you is that they control the narrative of the world wide web.
They make you feel [guilty for using adblockers](https://www.reddit.com/r/browsers/comments/1810egw/google_chrome_will_limit_ad_blockers_starting/) and add weird 
[nonstandard browser features](https://v4.chriskrycho.com/2017/chrome-is-not-the-standard.html) because they can.
Lately, the uBlock origin team just threw in the towel and [stopped supporting Chrome](https://www.theregister.com/2024/08/06/chrome_web_store_warns_end/).

But did anyone decide to switch away?
I get the feeling that by now people turn a blind eye towards Google's evil practices.

## But shouldn't Brave, Edge, Opera, or Vivaldi be sufficient?

Unfortunately not. They all use the [same browser engine](https://www.chromium.org/blink/) under the hood.
Browser makers make mistakes, so this engine is not perfect.
If it contains a bug and there's no competition, that bug becomes the standard.
Alternative browser engines need to implement the bug as well to support websites which depend on it.

## What Can I Do?

If you made it here, do yourself a favor and spend a few minutes trying Firefox.
Who knows? You might just like it.

[Try Firefox today,](https://www.mozilla.org/firefox) please?



