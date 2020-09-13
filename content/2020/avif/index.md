+++
title = "Adding AVIF Support to my Blog"
date = 2020-09-02
draft =true
[extra]
excerpt="""Did I mention that this website is fast?
Oh yeah, I did. Multiple times.
It's never fast enough, so today I go one step further by adding
support for the new AVIF image format to the blog. The results were suprising.
"""
+++

{{ figure(src="avif.svg") }}

Did I mention that this website is fast?
Oh yeah, [I did](/2019/tinysearch/). [Multiple times](/2017/image-previews/).

Few reasons (from normal to mildly concerning):

- Static site
- Cached on Cloudflare CDN
- HTTP/2 and HTTP/3 support
- No web fonts (sadly)
- No Google Analytics (got [something better...](https://jorgelbg.me/dashflare/))
- Avoid JavaScript whenever possible; CSS covers 90% of my use-cases
- Specify image width/height in HTML to avoid page reflows.
- Inlined, optimized SVG graphics and CSS
- [Static WASM search](https://github.com/tinysearch/tinysearch) (lazy loaded)
- Entire homepage is <10K (brotli-compressed) including graphics, thus should fit into the [first HTTP round-trip](https://www.tunetheweb.com/blog/critical-resources-and-the-first-14kb/).
- Heck, even the favicon is optimized for size

Then again it's 2020: **everyone** is optimizing their favicons, right? [...right!?](http://www.p01.org/defender_of_the_favicon/)

Well, turns out most other sites don't think about their user's data plans as much as I do. Actually that's an understatement: they don't care at all.  
But to me, **lean is beautiful**!

## What About Images?

I use SVG whenever possible for diagrams and illustrations.
Only if it's a photo I'll use JPEG or [WebP](https://developers.google.com/speed/webp/).

To be honest with you, I never really liked WebP.
There is a long [debate on the Mozilla bug tracker](https://bugzilla.mozilla.org/show_bug.cgi?id=856375) if you want to read more.
It might not even be smaller than JPEGs compressed with [MozJPEG](https://siipo.la/blog/is-webp-really-better-than-jpeg)!
Safari [still doesn't support it](https://caniuse.com/?search=webp) to this day.

Meet [AVIF](https://aomediacodec.github.io/av1-avif/), the new next-gen image compression format.
If WebP was the empire, AVIF would be the rebellion.
Open, peer-reviewed, no licensing fees &mdash; yup, just like the rebellion.

## Just Skip The Chase Already

Okay okay. Let's do this!

https://twitter.com/smashingmag/status/1297907612898471942

– 50% savings compared to JPEG
– 20% savings compared to WebP
– Supported by Chrome 85 and Firefox 80

[It hit me like a hurricane](https://www.youtube.com/watch?v=BixwVsiDdZM) 🌪️:

{% info() %}
Holy smokes, AVIF is supported by major browsers now!? 😲  
I want this for my blog!
{% end %}

[AVIF support for Zola](https://github.com/image-rs/image/issues/1152) is not quite there yet, but I want this now!
So I whipped up an [ugly Rust script](https://github.com/mre/mre.github.io/tree/source/helpers/img) (as I do) that creates AVIF images from my old JPEG and PNG images. I keep the raw original files around as a backup.

Under the hood it uses [cavif](https://github.com/kornelski/cavif) by [kornelski](https://github.com/kornelski).
(Yeah, it also creates webp as a fallback &mdash; just in case.)

## Performance Results

TODO

- Screenshot of Webpagetest before and after

## Fallback For Older Browsers

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
thing](https://github.com/mre/mre.github.io/blob/source/templates/shortcodes/figure.html)
is a bit more convoluted, but you get the idea.

There was one ugly problem with Github and AVIF: Their server returned
`` as a response type.

https://developers.cloudflare.com/workers/examples/modify-response

But hold on for a sec... is your browser even capable of showing AVIF?

BROWSER SUPPORT BUTTON HERE.

If that reads "yup", you're all set.  
If that reads "nope", then you have a few options:

- **On Firefox**: Open `about:config` from the address bar and search for `avif`.
- **On Chrome**: Make sure to update to the latest version.
- **On Safari**: I'm not sure what you're doing with your life. Try a real browser instead. 😏

So there you have it! AVIF from the future is here today.
Add it to your sites as well so that you save me some bandwidth next time I come by.

## Further reading

- [How to Use AVIF: The New Next-Gen Image Compression Format](https://reachlightspeed.com/blog/using-the-new-high-performance-avif-image-format-on-the-web-today/) &mdash; Nice introduction that highlithts some common pitfalls when integrating AVIF. It inspired me to add AVIF support.
- [AVIF has landed](https://jakearchibald.com/2020/avif-has-landed/) by Jake Archibald &mdash; Compares image sizes and qualities of different formats: SVG, JPEG, PNG, WebP, and AVIF.
- [Squoosh](https://squoosh.app/) &mdash; image compression service built with WebAssembly that supports AVIF.
- [Tons of great examples on how to configure Cloudflare workers](https://developers.cloudflare.com/workers/examples)
