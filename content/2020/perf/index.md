+++
title = "My Blog Just Got Faster: Cloudflare Workers and AVIF Support"
date = 2020-09-14
draft = false
[extra]
excerpt="""Did I mention that this website is fast?
Oh yeah, I did, multiple times.
It's never fast enough, so today I go one step further by adding
support for the new AVIF image format to the blog. The results were suprising.
"""
+++

{{ figure(src="hero.jpg") }}

Did I mention that this website is fast?
Oh yeah, [I did](/2019/tinysearch/), [multiple times](/2017/image-previews/).

Few reasons (from ordinary to the first signs of creeping insanity):

- Static site
- Cached on Cloudflare CDN
- HTTP/2 and HTTP/3 support
- No web fonts (sadly)
- No Google Analytics (got [something better...](https://jorgelbg.me/dashflare/))
- Avoiding JavaScript whenever possible; CSS covers 90% of my use-cases.
- Image width and height specified in HTML to avoid page reflows.
- Inlined, [optimized SVG graphics](https://jakearchibald.github.io/svgomg/) and hand-rolled CSS
- [Static WASM search](https://github.com/tinysearch/tinysearch) (lazy loaded)
- The entire homepage is <10K (brotli-compressed), including graphics, thus should fit into the [first HTTP round-trip](https://www.tunetheweb.com/blog/critical-resources-and-the-first-14kb/).
- Heck, even the favicon is optimized for size.

Then again, it's 2020: **everyone** is optimizing their favicons, right? [...right!?](http://www.p01.org/defender_of_the_favicon/)

Well, it turns out most other sites don't think about their user's data plans as much as I do. Actually, that's an understatement: they don't care at all. But to me, **lean is beautiful**!

## Wait, What About Images?

I prefer SVG for diagrams and illustrations.
Only if it's a photo, I'll use JPEG or [WebP](https://developers.google.com/speed/webp/).

To be honest with you, I never really liked WebP.
The gist is that it might not even be smaller than JPEGs compressed with [MozJPEG](https://siipo.la/blog/is-webp-really-better-than-jpeg).
There is a lengthy [debate on the Mozilla bug tracker](https://bugzilla.mozilla.org/show_bug.cgi?id=856375) if you want to read more.
To this day, [Safari doesn't support WebP](https://caniuse.com/?search=webp).

## Hello AVIF 👋

Meet [AVIF](https://aomediacodec.github.io/av1-avif/), the new next-gen image compression format. Check this out:

{{ figure(src="stats.svg", credits="[ReachLightSpeed.com](https://reachlightspeed.com/blog/using-the-new-high-performance-avif-image-format-on-the-web-today/)") }}

It's already supported by Chrome 85 and Firefox 80.  
[Then it hit me like a hurricane](https://www.youtube.com/watch?v=BixwVsiDdZM) 🌪️:

{% info() %}
😲 Holy smokes, AVIF is supported by major browsers now!?  
I want this for my blog!
{% end %}

Yes and no.

I'm using [Zola](https://www.getzola.org/) for my blog, and
[AVIF support for Zola](https://github.com/image-rs/image/issues/1152) is not yet there, but I want it now!
So I whipped up an [ugly Rust script](https://github.com/mre/mre.github.io/tree/source/helpers/img) (as you do) that creates AVIF images from my old JPEG and PNG images. I keep the original raw files around just in case.

Under the hood, it calls [cavif](https://github.com/kornelski/cavif) by [Kornel Lesiński](https://github.com/kornelski).

## Data Savings

The results of AVIF on the blog were nothing short of impressive:

{{ figure(src="own_stats.svg", caption="Total image size for [endler.dev/2020/sponsors](https://endler.dev/2020/sponsors)") }}

## Check Your Browser

But hold on for a sec... is your browser even capable of showing AVIF?

<picture>
  <source srcset="avif_supported.avif" type="image/avif" />
  <img src="avif_not_supported.jpg" />
</picture>

If that reads "yup," you're all set.  
If that reads "nope," then you have a few options:

- **On Firefox**: Open `about:config` from the address bar and search for `avif`.
- **On Chrome**: Make sure to update to the latest version.
- **On Safari**: I'm not sure what you're doing with your life. Try a real browser instead. 😏

## Workaround I: Fallback For Older Browsers

HTML is great in that your browser ignores unknown new syntax.
So I can use the `<picture>` element to serve the right format to you. (Look ma, no JavaScript!)

```html
<picture>
  <source srcset="fancy_browser.avif" />
  <source srcset="decent_browser.webp" />
  <img src="meh_browser.jpg" />
</picture>
```

[The real
thing](https://github.com/mre/endler.dev/blob/master/templates/shortcodes/figure.html)
is a bit more convoluted, but you get the idea.

## Workaround II: Wrong Content-Type On Github Pages

There was one ugly problem with Github and AVIF, though: Their server returned a
`Content-Type: application/octet-stream` header.

This meant that the images _did not load_ on Firefox.

There is no way to fix that on my side as Github is hosting my page. Until now!
I wanted to try Cloudflare's [Workers Sites](https://workers.cloudflare.com/sites) for a long time, and this bug
finally made me switch. Basically, I run the full website as an edge worker
right on the CDN; no own web server is needed. What's great about it is that
the site is fast _everywhere_ now &mdash; even in remote locations &mdash; no more
roundtrips to a server.

By running an edge worker, I also gained full control over the request- and response objects.
I added [this gem](https://github.com/mre/endler.dev/blob/1f142c14ab40ca264c4c8c599a5db6b91ca9cbaa/workers-site/index.js#L53-L56) of a snippet to intercept the worker response:

```javascript
if (/\.avif$/.test(url)) {
  response.headers.set("Content-Type", "image/avif");
  response.headers.set("Content-Disposition", "inline");
}
```

And bam, Bob's your uncle. Firefox is happy.
You can read more about modifying response objects [here](https://developers.cloudflare.com/workers/examples/modify-response).

Another side-effect of Workers Sites is that a production deployment takes [one minute](https://github.com/mre/endler.dev/actions) now.

## Performance Results After Moving To Cloudflare

{{ figure(src="cdn_before.jpg", caption="Website response time before", credits="[KeyCDN](https://tools.keycdn.com/performance?url=https://endler.dev)") }}
{{ figure(src="cdn_after.jpg", caption="Website response time after", credits="[KeyCDN](https://tools.keycdn.com/performance?url=https://endler.dev)") }}

{{ figure(src="pingdom_before.jpg", caption="Page size and rating before", credits="[Pingdom.com](https://tools.pingdom.com/#5d1d402401400000)") }}
{{ figure(src="pingdom_after.jpg", caption="Page size and rating after", credits="[Pingdom.com](https://tools.pingdom.com/#5d226db3af800000)") }}

I don't have to hide from a comparison with well-known sites either:

{{ figure(src="speedcurve.png", caption="Comparison with some other blogs I read", credits="[Speedcurve](speedcurve.com)") }}

## Further reading

- [How to Use AVIF: The New Next-Gen Image Compression Format](https://reachlightspeed.com/blog/using-the-new-high-performance-avif-image-format-on-the-web-today/) &mdash; Nice introduction that highlights some common pitfalls when integrating AVIF. It inspired me to add AVIF support.
- [AVIF has landed](https://jakearchibald.com/2020/avif-has-landed/) by Jake Archibald &mdash; Compares image sizes and qualities of different formats: SVG, JPEG, PNG, WebP, and AVIF.
- [Squoosh](https://squoosh.app/) &mdash; image compression service built with WebAssembly that supports AVIF
- [Tons of great examples on how to configure Cloudflare workers](https://developers.cloudflare.com/workers/examples)
- [Cloudflare Workers Sites](https://workers.cloudflare.com/sites)
