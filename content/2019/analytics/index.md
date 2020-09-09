+++
title="Replacing Google Analytics with a free, privacy-first solution in Rust and WASM (no JS required)"
date=2019-04-07
draft=true
+++

Running your own website is a great way to try out new ideas.

Ad blocking: around 50% of my request are blocked
No JavaScript needed
Privacy - not a fan of Google's centralized internet
Performance - GA is quite slow and pulls in a lot of Javascript

Learn more about my site and readers

 https://news.ycombinator.com/item?id=13638431
> Please don't contribute to Google's tracking dominance over the web. How insane is it that one company runs their javascript on 90% of the web? 

Why not Cloudflare logs?
* Expensive
* Custom solution also gives the cached request

avoid caching:
Just disable your etag and add a expiry date of the past.


I wanted to see what I could for free.
Github and Netlify do not have analytics.

Matomo (formerly Piwik) requires somewhere to host.


 (I don't actually need detailed user tracking)


> Obviously with log parsing you don’t get as much information as a JavaScript-heavy, Google Analytics-style system. There’s no screen sizes, no time-on-page metrics, etc. But that’s okay for me! I’m free of the Google, and I had a bit of fun building it.


Others have done the same:
*  https://benhoyt.com/writings/replacing-google-analytics/