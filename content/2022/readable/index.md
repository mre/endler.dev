+++
title="A Reader Mode Proxy for the Slow Web"
date=2022-11-03
draft=false
[taxonomies]
tags=["dev", "rust"]
[extra]
credits = [
  { name = "Simon Brüggen", url="https://github.com/m3t0r" },
]
+++

{{ figure(src="darkmode.jpg", caption="Reader showing an article in light and dark mode.", link="https://readable.shuttleapp.rs") }}

{% info() %}
_tl;dr:_ I built a service that takes any article and creates a pleasant-to-read, printable version.
It is similar to Reader View in Firefox/Safari, but also works on older
browsers, can be shared and has a focus on beautiful typography.
Try it [here](https://readable.shuttleapp.rs/).
{% end %}

The web used to be such a fun place.

Nowadays? Meh.
Trackers, ads, bloat, fullscreen popups, autoplaying videos... it's all so _exhausting_.

I just want to read long-form posts without distractions with a good cup of tea,
the cat sleeping on the windowsill and some light snow falling in front of the window.

{{ figure(src="lofi.jpg") }}

## The Slow Web

I'm a big fan of the [Slow Web movement](https://www.jackcheng.com/the-slow-web/)
and of [little sites that do one thing well](https://herman.bearblog.dev/big-fat-websites/).

For reading long-form text clutter-free I use [Reader
View](https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages)
in Firefox, and while it doesn't always work and it's not the prettiest I like it.

There are reader modes in other browsers as well, but some of them &mdash; like Chrome &mdash; [hide
it behind a feature flag](https://www.howtogeek.com/423643/how-to-use-google-chromes-hidden-reader-mode/).
Other browsers, like the one on my eBook reader, don't come with a reader mode at all,
which leaves me with a subpar and slow browsing experience on my main device used for reading.

So I built _a reader mode as a service_ with a focus on _beautiful typography_
which works across all browsers.
It's very basic, but I use it to read articles on my older devices and
it could also make content more accessible in regions with low bandwidth or
while travelling.

## Building It

Lately I saw a post about [circumflex, a Hacker News terminal
client](https://news.ycombinator.com/item?id=33192518). The tool did a solid job
at rendering website content and I wondered if I can retrofit that into a proxy
server.

The Golang cleanup code is [here](https://github.com/bensadeh/circumflex/blob/d69467963e4a27f1ea75f0017ee4d4decc304de4/reader/reader.go#L16-L36):

```go
func GetArticle(url string, title string, width int, indentationSymbol string) (string, error) {
    articleInRawHTML, httpErr := readability.FromURL(url, 5*time.Second)
    if httpErr != nil {
        return "", fmt.Errorf("could not fetch url: %w", httpErr)
    }
    // ...
}
```

They use [go-readability](https://github.com/go-shiori/go-readability), a port
of [Mozilla's Readability](https://github.com/mozilla/readability). The Rust
equivalent is [readability](https://crates.io/crates/readability) and it's
simple enough to use:

```rust
use readability::extractor;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let response = extractor::scrape("https://endler.dev/2022/readable")?;
    println!("{}", response.content);
    Ok(())
}
```

Before we write a full proxy server, let's write a simple CLI tool that takes a
URL and outputs a clean, readable HTML file.

```rust
use readability::extractor;
use std::fs::File;
use std::io::Write;

fn main() -> Result<(), Box<dyn std::error::Error>> {
	// read the URL from the command line
	let url = std::env::args().nth(1).expect("Please provide a URL");

	let response = extractor::scrape(&url)?;
	let mut file = File::create("index.html")?;
	file.write_all(response.content.as_bytes())?;
	Ok(())
}
```

The output already looked surprisingly good.
Next I added a simple HTML template to wrap the response content.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <link rel="stylesheet" href="yue.css" />
    <style type="text/css">
      body {
        margin: 0;
        padding: 0.4em 1em 6em;
        background: #fff;
      }
      .yue {
        max-width: 650px;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div class="yue">{{content}}</div>
  </body>
</html>
```

No need to use a full-blown template engine for now; we can just use
`str::replace` to replace the `{{content}}` placeholder with the actual content.
😉

## Proxy Setup

The proxy setup is super simple with [shuttle](https://www.shuttle.rs/). It's my
second project after [zerocal](/2022/zerocal/), which is hosted on shuttle and
I'm very happy with how smooth the process is. 🚀
Let's call the app `readable`:

```
cargo shuttle init --axum --name readable
```

This creates a small [Axum](https://github.com/tokio-rs/axum) app with a simple
hello world route.

## Roadblock No. 1: `reqwest`

When I integrated the [readability](https://crates.io/crates/readability) crate
into the project I hit a minor roadblock.

I used `extractor::scrape` just like above and the proxy started locally.
However when I wanted to fetch a website from the proxy, I got an error:

```
thread 'tokio-runtime-worker' panicked at
'Cannot drop a runtime in a context where blocking is not allowed.
This happens when a runtime is dropped from
within an asynchronous context.'
```

This meant that I started a runtime inside a runtime.

After checking the source code of the `readability` crate, I found that it
builds a `reqwest::blocking::Client` and uses that to fetch the URL.
After that request, the client is dropped which causes the runtime to be shut
down.

I fixed this by using a `reqwest::Client` instead of the `reqwest::blocking::Client`.

```rust
// reqwest::blocking::Client
let client = reqwest::blocking::Client::new();

// reqwest::Client
let client = reqwest::Client::new();
```

Now I had the content of the article, but I still needed to pass it to
`readability`. Fortunately they provide a function named `extractor::extract`
that takes something that implements `Read` and returns the extracted content.

However, the `reqwest::Response` doesn't implement `Read` (in contrast to the
`reqwest::blocking::Response`). So I needed to convert it to a `Read`able type
myself.

Luckily, the `reqwest::Response` has a `bytes` method that returns a `Bytes`
object. The `Bytes` object implements `Read` and I can use it to call
`extractor::extract`.

```rust
let body = client.get(&url).await?.text().await?;
let bytes = body.bytes().await?;
let response = extractor::extract(&mut res, &url)?;
```

## Roadblock No. 2: Routing

The app didn't crash anymore, but I still didn't get any response.

My router looked like this:

```rust
#[shuttle_service::main]
async fn axum() -> shuttle_service::ShuttleAxum {
    let router = Router::new().route("/:url", get(readable));
    let sync_wrapper = SyncWrapper::new(router);

    Ok(sync_wrapper)
}
```

Turns out that when I use `/:url` as the route, it doesn't match the path
`/https://example.com` because `:` matches only a single segment up to the
first slash.

The solution was to use `/*url` instead, which is a wildcard route that matches
all segments until the end.

## Typography and Layout

{{ figure(src="nyt.jpg", caption="New York Times website (left) vs reader mode (right)") }}

For my first prototype I used a CSS framework called
[yue.css](https://github.com/typlog/yue.css) because it was the first thing I
found which looked nice.

For the final version I ended up mimicking the style of [Ruud van Asseldonk's
blog](https://ruudvanasseldonk.com/) because it always reminded me of reading a
well-typeset book.

For fonts I chose two of my favorites

- [Crimson Pro](https://github.com/Fonthausen/CrimsonPro) for the body text.
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) for the code.

Both are licensed under the [SIL Open Font License 1.1](https://opensource.org/license/openfont-html/).

You can even use `readable` from the terminal.

```
lynx https://readable.shuttleapp.rs/https://en.wikipedia.org/wiki/Alan_Turing
```

## Caveats

The proxy is far from perfect.
It's something I built in a few hours for my personal use.

- It doesn't always produce valid HTML.
- JavaScript is not executed, so some websites don't work properly. Some might
  say that's feature, not a bug. 😉
- That is also true for websites with sophisticated paywalls or bot-detection. A
  workaround would be to use a headless browser like
  [ScrapingBee](https://www.scrapingbee.com) or
  [Browserless](https://www.browserless.io/), but I didn't want to add that
  complexity to the project.
- The `readability` library takes a lot of freedom in formatting the document
  however it pleases. It can sometimes produce weird results. For example, it
  loves to mangle code blocks.

## Credits

I was not the first person to build a readability proxy. I found out about
[readable-proxy](https://github.com/n1k0/readable-proxy) when I did my research,
but the project seems to be abandoned. Nevertheless it was nice to see that
others had the same need.

Thanks to [Ruud van Asseldonk](https://ruudvanasseldonk.com/) for open sourcing
his [blog](https://github.com/ruuda/blog). 🙏 His writing and documentation are
always a great source of inspiration to me.

## Conclusion

{{ figure(src="kobo.jpg", caption="The browser on my old Kobo eBook reader using the readability proxy.") }}

In times where [the most popular browser might kill off ad
blockers](https://tech.co/news/google-chrome-ad-blockers-2023), a little service
for reading articles without ads or tracking can come in handy. I'm not saying you
should use it to send all your traffic through it, but it's a nice tool to have
in your toolbox for a rainy day, a warm drink and a great article. ☕

Feel free to deploy your own instance of `readable` or use the one I'm hosting.
The source code is available on [GitHub](https://github.com/mre/readable).
Maybe one of you wants to help me maintain it.
