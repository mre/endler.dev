+++
title="Living on the Edge"
date=2019-03-21
draft = true
+++

[extra]
Inspiration from video at 
https://www.youtube.com/watch?time_continue=1961&v=JX2qrdp0WT4


Living on the Edge - Running my entire website on the CDN

My private website serves as a kind of sandbox for new ideas.
It's fun and challenging to think about how to make the fastest website possible.
Every millisecond counts

Over time I've improved speed quite a bit

* Moving from Wordpress to Static HTML
* Use Cloudflare as a CDN
* Inline assets
* Prefer SVG over JPGs because they compress better

I've even optimized the size of my favicons

All of this still wasn't enough.
Recently I checked my first byte time from all over the web and it was slow

Screenshot of https://tools.keycdn.com/performance

The reason is cold caches

Cloudflare is a pull CDN. It lazily fetches my page from Github on request.

There are ways to warm up the cache globally.
https://community.cloudflare.com/t/warming-up-cache-geographically-using-webpagetest/35447

Another problem that I had was: no control over my access log.

Web Workers

They basically gave me the fire.
So I had this crazy idea

Why not run my entire site as a Web Worker?

pure Rust
I call it grid

Requirements:

* very small site (only a few blog articles)
* not much computation needed (static content)

Async logging of requests

Free hosting

Above 100.000 requests per month I pay $5.

If you're in a popular region, chances are you won't even notice the change.
Usually the caches are quite warmed up in Europe and North America.

You will however notice the change everywhere else. Because this saves the roundtrip time from Cloudflare to Github.

Lastly, thanks to Cloudflare and the Web Worker team for making this possible.
I'll definitely experiment with the same idea at work.

This is how technology should be for: it allows for innovation beyond of what was imagined by the inventors.