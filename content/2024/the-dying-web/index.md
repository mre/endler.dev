+++
title="The Dying Web"
date=2024-08-08
draft=false
[taxonomies]
tags=["culture"]
+++

I look left and right, and I'm the only one who still uses Firefox.

{{ figure(src="travolta.gif") }}

At conferences and in coworking spaces, it's always the same scene: people using some flavor of Chrome.
Sometimes it's Brave, sometimes Chromium, most of the time it's just Google Chrome.

I find that hilariously appalling.

An entire generation grew up with access to great free tools and open standards, which helped them jumpstart their careers and 
gave them access to excellent technology for free.

Now, the world's largest websites are owned by the same company, which also owns the world's most popular browser and
search engine. Coincidentally, they are also the world's largest advertising company.
And people are wondering why they can't block ads on YouTube anymore.

We gave it all away for nothing.

Let me be the first to admit that I too am not without sin.
There was a weak moment about 15 years ago when browser performance became so unbearable on anything other than Chrome
that it forced my hand to make the switch.
And yes, for a while, life was good and websites loaded quickly.

Reluctantly, I made the switch back to Firefox after a while, because open standards and privacy were
more important than a few milliseconds of loading time.
I could still understand why people would use Chrome, but I was happy with my choice.

Then [Firefox Quantum](https://blog.mozilla.org/en/mozilla/introducing-firefox-quantum/) came around, and I 
told all my fellow developer friends about it.
To me, it was the best browser on the market, and I was proud to be a Firefox user again.
It was fast, snappy, and had a great add-on ecosystem.

To my surprise, nobody cared.

## Bad Habits Die Hard

Maybe people stayed with Chrome out of habit.

Performance and privacy aside, I just don't know how people can cope with Chrome's limited customizability.
It's hilarious to watch people with 200 tabs named "G", "Y", or "X" struggle to find that one document they opened a week ago.

In comparison, vertical tabs on Firefox with add-ons like [Sidebery](https://addons.mozilla.org/en-US/firefox/addon/sidebery/)
make Chrome look like a toy.

Anyhow, Chrome.

There was a time when I tried to educate people on the negative effects of browser monoculture.
Okay, my mum didn't get it, but I was more disappointed by my fellow devs.
Everyone took the easy route and happily stayed on Uncle Google's lap.

At this point, I neither have the willpower nor the energy to fight back;
it's hopeless. It's probably easier to get blood from a stone
than to convince someone to switch back to Firefox.
It's so easy to switch, [you won't even lose any open tabs](https://support.mozilla.org/en-US/kb/switching-chrome-firefox)!

{{ figure(src="marketshare.png") }}

## Nobody Forces You to Use Chrome

True, but the issues don't stop at my front door.
As an outsider, I need to live with the consequences of browser monoculture every day.

Quite a few websites are unusable by now because they got "optimized for Chrome."
[Microsoft Teams](https://github.com/webcompat/web-bugs/issues/25070#issuecomment-460721700), for example,
and [the list is long](https://github.com/webcompat/web-bugs/issues?q=is%3Aopen+is%3Aissue+label%3Abrowser-firefox).
These websites fail for no good reason.

There are positive examples, too.
[Zencastr](https://zencastr.com/), for example, used to be broken on Firefox, but they fixed it. 

I also use Chrome for online calls, because tools like [Jitsi](https://meet.jit.si/) don't work well on Firefox.
Maybe it's because of Firefox's WebRTC support? Or, [maybe it's because of Chrome](https://blog.mozilla.org/webrtc/):

> **Pop Quiz**: If a website wants to play out of different speakers on your system, what permission must it have?
>
> 1. Speaker-selection permission
> 2. Microphone permission
>
> If you answered 2, then chances are you know your WebRTC stuff well, but you're probably on a Chromium browser.

## How could Google get free rein?

Because everyone and their car stopped testing their stuff anywhere else.
If everyone tweaks their site for Chrome, well, of course the site will work just fine on Chrome!
We find ways around Chrome's weird quirks.
More users join the bandwagon because stuff "just works" and the vicious cycle continues.
I can't blame them. 
It's easier to ride a horse in the direction it is going.

## But at what cost?

\*Elrond voice\*: We've been down this road before. (Okay, I was there.)
We called it the *Browser Wars*: Netscape vs Internet Explorer. Netscape lost and Microsoft ruled over the web with an iron fist. It wasn't fun.
We had more hacks around browser limitations than actual website functionality. Parents put their kids through college by working around browser bugs for money.

Microsoft tried *really* hard to make life as miserable as possible for everybody:

> Internet Explorer has introduced an array of proprietary extensions to many of the standards, including HTML, CSS, and the DOM. This has resulted in several web pages that appear broken in standards-compliant web browsers and has introduced the need for a "quirks mode" to allow for rendering improper elements meant for Internet Explorer in these other browsers. &mdash; [Wikipedia](https://en.wikipedia.org/wiki/Internet_Explorer)

Essentially, they broke the web and we all warmed our hands on the dumpster fire.
All we got in return was quirks mode.

Google is smarter! They break the web, too, but they make you stand inside the fire.

## Why should I care about a browser? They are all the same anyways.

...says the developer who gets [tracked by Google](https://www.forbes.com/sites/zakdoffman/2024/06/16/google-chrome-tracking-on-windows-android-iphone-for-200-more-days/) 
every waking moment.

{{ figure(src="incognito.jpg", credits="https://www.skeletonclaw.com/image/710734055173472257") }}

You see, Chrome is reeeeally good at marketing.
They say all the right things: We're fast! We're open source! We have the latest features!
What they don't tell you is that they control the narrative of the World Wide Web.
They make you feel [guilty for using adblockers](https://www.reddit.com/r/browsers/comments/1810egw/google_chrome_will_limit_ad_blockers_starting/) and add weird 
[nonstandard browser features](https://v4.chriskrycho.com/2017/chrome-is-not-the-standard.html) because they can.
Lately, the uBlock Origin team just threw in the towel and [stopped supporting Chrome](https://www.theregister.com/2024/08/06/chrome_web_store_warns_end/).

But did anyone decide to jump ship?
I get the feeling that by now people turn a blind eye to Google's evil practices.

## But shouldn't Brave, Edge, Opera, or Vivaldi be sufficient?

Unfortunately not. They all use the [same browser engine](https://www.chromium.org/blink/) under the hood.
Browser makers make mistakes, so this engine is not perfect.
If it contains a bug and there's no competition, that bug becomes the standard.
Alternative browser engines need to implement the bug as well to support websites which depend on it.

## I Use Safari

Congratulations, you switched from a browser controlled by a 2 trillion dollar company to a browser controlled by a 3 trillion dollar company. Oh, and it doesn't run on Windows or Linux.
Both Apple and Google would throw you under the bus if it made them more profit.
Oh, and did you know that Google paid Apple [20 billion dollars in 2022](https://www.pymnts.com/antitrust/2024/google-ruling-may-blunt-apple-services-revenue-ecosystem-growth/) to be the default search engine on Safari?

## What Can I Do?

If you've made it this far, do yourself a favor and spend a few minutes trying Firefox.
Who knows? You might just like it.

[Try Firefox today,](https://www.mozilla.org/firefox) please?
