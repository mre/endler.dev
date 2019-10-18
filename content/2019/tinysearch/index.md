+++
title="A Tiny, Static, Full-Text Search Engine using Rust and WebAssembly"
date=2019-10-17
+++

Static site generators are magical. They combine the best of both worlds:
dynamic content without sacrificing performance.

Over the years, this blog has been running on [Jekyll], [Cobalt], and, lately,
[Zola].

One thing I always disliked, however, was the fact that static websites don't
come with "static" search engines, too. Instead, people resort to [custom Google
searches][google], external search engines like [Algolia], or pure
JavaScript-based solutions like [lunr.js] or [elasticlunr].

All of these work fine for most sites, but it never felt like the final answer.

I didn't want to add yet another dependency on Google; neither did I want to use
a stand-alone web-backend like Algolia, which adds latency and is proprietary.

On the other side, I'm not a huge fan of JavaScript-heavy websites. For example,
just the search indices that lunr creates can be [multiple megabytes
in size](https://github.com/olivernn/lunr.js/issues/268#issuecomment-304490937).
That feels lavish - even by today's bandwidth standards. On top of that,
[parsing JavaScript is still
time-consuming](https://v8.dev/blog/cost-of-javascript-2019).

I wanted some simple, lean, and self-contained search, that could be deployed
next to my other static content.

As a consequence, I refrained from adding search functionality to my blog at
all. That's unfortunate because, with a growing number of articles, it gets
harder and harder to find relevant content.

## The Idea

Many years ago, in 2013, I read ["Writing a full-text search engine using Bloom
filters"][stavros] &mdash; and it was a revelation.

The idea was simple: Let's run all articles through a generator that creates a
tiny, self-contained search index using this magical data structure called a
✨*Bloom Filter* ✨.

## What's a Bloom Filter?

Roughly speaking, a [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter) is a space-efficient way to
check if an element is in a set.

The trick is that it doesn't store the elements themselves; it just knows with
some confidence that they were stored before. In our case, it can say with a
certain _error rate_ that a word is in an article.

{{ figure(src="./bloomfilter.svg", caption="A Bloom filter stores a
'fingerprint' (a number of hash values) of all inputs values instead of the raw
input. The result is a low-memory-footprint data structure. This is an example
of 'hello' as an input.") }}

Here's the Python code from the original article that generates the Bloom
filters for each post (courtesy of [Stavros
Korokithakis](https://www.stavros.io)):

```python
filters = {}
for name, words in split_posts.items():
  filters[name] = BloomFilter(capacity=len(words), error_rate=0.1)
  for word in words:
    filters[name].add(word)
```

The memory footprint is extremely small, thanks to `error_rate`, which allows
for a negligible number of false positives.

I immediately knew that I wanted something like this for my homepage. My idea
was to directly ship the Bloom filters and the search engine to the browser. I
could finally have a small, static search without the need for a backend!

## Headaches

The disillusionment came quickly.

I had no idea how to bundle and minimize the generated Bloom filters, let alone
run them on clients. The original article briefly touches on this:

> You need to implement a Bloom filter algorithm on the client-side. This will
> probably not be much longer than the inverted index search algorithm, but it’s
> still probably a bit more complicated.

I didn't feel confident enough in my JavaScript skills to pull this off. Back in
2013, NPM was a mere three years old, and WebPack just turned one, so I also
didn't know where to look for existing solutions.

Unsure what to do next, my idea remained a pipe dream.

## A New Hope

Five years later, in 2018, the web had become a different place. Bundlers were
ubiquitous, and the Node ecosystem was flourishing. One thing, in particular,
revived my dreams about the tiny static search engine: [WebAssembly].

> WebAssembly (abbreviated Wasm) is a binary instruction format for a
> stack-based virtual machine. Wasm is designed as a portable target for
> compilation of high-level languages like C/C++/Rust, enabling deployment on
> the web for client and server applications. [[source][webassembly]]

This meant that I could use a language that I was familiar with to write the
client-side code &mdash; Rust! 🎉

My journey started with a [prototype back in January
2018](https://github.com/mre/tinysearch/commit/82c1d36835348718f04c9ca0dd2c1ebf8b19a312).
It was just a direct port of the Python version from above:

```rust
let mut filters = HashMap::new();
for (name, words) in articles {
  let mut filter = BloomFilter::with_rate(0.1, words.len() as u32);
  for word in words {
    filter.insert(&word);
  }
  filters.insert(name, filter);
}
```

While I managed to create the Bloom filters for every article, I _still_ had no
clue how I should package that up for the web... until [wasm-pack came along in
February
2018](https://github.com/rustwasm/wasm-pack/commit/125431f97eecb6f3ca5122f8b345ba5b7eee94c7).

## Whoops! I Shipped Some Rust Code To Your Browser.

Now I had all the pieces of the puzzle:

- Rust - A language I am comfortable with
- [wasm-pack] - A bundler for WebAssembly modules
- A working prototype that served as a proof-of-concept

The search box you see at the top of this page is the outcome. It fully runs on Rust using
WebAssembly (a.k.a the [RAW stack](https://twitter.com/timClicks/status/1181822319620063237)). Try it now if you like.

There were quite a few obstacles along the way.

## Bloom Filter Crates

I looked into a few Rust libraries (crates) that implement Bloom filters.

First, I tried jedisct1's
[rust-bloom-filter](https://github.com/jedisct1/rust-bloom-filter), but the types
didn't implement
[Serialize](https://docs.serde.rs/serde/trait.Serialize.html)/[Deserialize](https://docs.serde.rs/serde/trait.Deserialize.html).
This meant that I could not store my generated Bloom filters inside the binary and load
them from the client-side.

After trying a few others, I found the
[cuckoofilter](https://github.com/seiflotfy/rust-cuckoofilter) crate, which
supported serialization. The behavior is similar to Bloom filters, but if you're
interested in the differences, you can look at [this
summary](https://brilliant.org/wiki/cuckoo-filter/).

Here's how to use it:

```rust
let mut cf = cuckoofilter::new();

// Add data to the filter
let value: &str = "hello world";
let success = cf.add(value)?;

// Lookup if data was added before
let success = cf.contains(value);
// success ==> true
```

Let's check the output size when bundling the filters for ten articles on my blog using cuckoo filters:

```
~/C/p/tinysearch ❯❯❯ l storage
Permissions Size User    Date Modified Name
.rw-r--r--   44k mendler 24 Mar 15:42  storage
```

**44kB** doesn't sound too shabby, but these are just the cuckoo filters for ten
articles, serialized as a Rust binary. On top of that, we have to add the search
functionality and the helper code. In total, the client-side code weighed in at
**216kB** using vanilla wasm-pack. Too much.

## Trimming Binary Size

After the sobering first result of 216kB for our initial prototype, we have a
few options to bring the binary size down.

The first is following [johnthagen's](https://github.com/johnthagen) advice on
[minimizing Rust binary size](https://github.com/johnthagen/min-sized-rust).

By setting a few options in our `Cargo.toml`, we can shave off quite a few bytes:

```
"opt-level = 'z'" => 249665 bytes
"lto = true"      => 202516 bytes
"opt-level = 's'" => 195950 bytes
```

Setting `opt-level` to `s` means we trade size for speed,
but we're preliminarily interested in minimal size anyway. After all, a small download size also improves performance.

Next, we can try [wee_alloc](https://github.com/rustwasm/wee_alloc), an alternative Rust allocator
producing a small `.wasm` code size.

> It is geared towards code that makes a handful of initial dynamically sized allocations, and then performs its heavy lifting without any further allocations. This scenario requires some allocator to exist, but we are more than happy to trade allocation performance for small code size.

Exactly what we want. Let's try!

```
"wee_alloc and nightly" => 187560 bytes
```

We shaved off another 4% from our binary.

Out of curiosity, I tried to set [codegen-units](https://doc.rust-lang.org/rustc/codegen-options/index.html#codegen-units) to 1, meaning we only use a single thread for code generation. Surprisingly, this resulted in a slightly smaller binary size.

```
"codegen-units = 1" => 183294 bytes
```

Then I got word of a Wasm optimizer called `binaryen`.
On macOS, it's available through homebrew:

```
brew install binaryen
```

It ships a binary called `wasm-opt` and that shaved off another 15%:

```
"wasm-opt -Oz" => 154413 bytes
```

Then I removed web-sys as we don't have to bind to the DOM: 152858 bytes.

There's a tool called [twiggy](https://github.com/rustwasm/twiggy) to profile the code size of Wasm binaries.
It printed the following output:

```
twiggy top -n 20 pkg/tinysearch_bg.wasm
 Shallow Bytes │ Shallow % │ Item
───────────────┼───────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────
         79256 ┊    44.37% ┊ data[0]
         13886 ┊     7.77% ┊ "function names" subsection
          7289 ┊     4.08% ┊ data[1]
          6888 ┊     3.86% ┊ core::fmt::float::float_to_decimal_common_shortest::hdd201d50dffd0509
          6080 ┊     3.40% ┊ core::fmt::float::float_to_decimal_common_exact::hcb5f56a54ebe7361
          5972 ┊     3.34% ┊ std::sync::once::Once::call_once::{{closure}}::ha520deb2caa7e231
          5869 ┊     3.29% ┊ search
```

From what I can tell, the biggest chunk of our binary is occupied by the raw data section for our articles.
Next up, we got the function headers and some float to decimal helper functions, that most likely come from deserialization.

Finally, I tried [wasm-snip](https://github.com/rustwasm/wasm-snip), which replaces a WebAssembly function's body with an `unreachable` like so, but it didn't reduce code size:

```
wasm-snip --snip-rust-fmt-code --snip-rust-panicking-code -o pkg/tinysearch_bg_snip.wasm pkg/tinysearch_bg_opt.wasm
```

After tweaking with the parameters of the cuckoo filters a bit and removing
[stop words](https://en.wikipedia.org/wiki/Stop_words) from the articles, I
arrived at **121kB** (51kB gzipped) &mdash; not bad considering the average image size on the web is [around 900kB](https://httparchive.org/reports/state-of-images#bytesImg).
On top of that, the search functionality only gets loaded when a user clicks into the search field.

## Frontend and Glue Code

wasm-pack will auto-generate the JavaScript code to talk to Wasm.

For the search UI, I customized a few JavaScript and CSS bits from
[w3schools](https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_autocomplete).
It even has keyboard support!
Now when a user enters a search query, we go through the cuckoo filter of each
article and try to match the words. The results are scored by the number of
hits. Thanks to my dear colleague [Jorge Luis Betancourt](https://github.com/jorgelbg/) for adding that part.

![Video of the search functionality](./anim-opt.gif)

(Fun fact: this animation is about the same size as the Wasm search itself.)

Only whole words are matched. I would love to add prefix-search, but the
binary became too big when I tried.

## Usage

The standalone binary to create the Wasm file is called `tinysearch`.
It expects a single path to a JSON file as an input:

```
tinysearch path/to/corpus.json
```

This `corpus.json` contains the text you would like to index. The format is pretty straightforward:

```json
[
  {
    "title": "Article 1",
    "url": "https://example.com/article1",
    "body": "This is the body of article 1."
  },
  {
    "title": "Article 2",
    "url": "https://example.com/article2",
    "body": "This is the body of article 2."
  }
]
```

You can generate this JSON file with any static site generator.
[Here's my version for Zola](https://github.com/mre/mre.github.io/tree/1c731717b48afb584e54ca4dd5fd649f9b74e51c/templates):

```t
{% set section = get_section(path="_index.md") %}

[
  {%- for post in section.pages -%}
    {% if not post.draft %}
      {
        "title": {{ post.title | striptags | json_encode | safe }},
        "url": {{ post.permalink | json_encode | safe }},
        "body": {{ post.content | striptags | json_encode | safe }}
      }
      {% if not loop.last %},{% endif %}
    {% endif %}
  {%- endfor -%}
]
```

I'm pretty sure that the Jekyll version looks quite similar.
[Here's a starting point](https://learn.cloudcannon.com/jekyll/output-json/).

## Observations

- This is still the wild west: unstable features, nightly Rust, documentation
  gets outdated almost every day.  
  Bring your thinking cap!
- Creating a product out of a good idea is a lot of work. One has to pay
  attention to many factors: ease-of-use, generality, maintainability,
  documentation and so on.
- Rust is very good at removing dead code, so you usually don't pay for what
  you don't use. I would still advise you to be very conservative about the
  dependencies you add to a Wasm binary because it's tempting to add features
  that you don't need and which will add to the binary size. For example, I
  used Structopt during testing, and I had a `main()` function that was parsing
  these command-line arguments. This was not necessary for Wasm, so I
  removed it later.
- I understand that not everyone wants to write Rust code. It's complicated to
  get started with, but the cool thing is that you can do the same thing with
  almost any other language, too. For example, you can write Go code and
  transpile to Wasm, or maybe you prefer PHP or Haskell. There is support for
  [many languages](https://github.com/appcypher/awesome-wasm-langs) already.
- A lot of people dismiss WebAssembly as a toy technology. They couldn't be
  further from the truth. In my opinion, WebAssembly will revolutionize the way we build
  products for the web and beyond. What was very hard just two years ago is now
  easy: shipping code in any language to every browser. I'm super excited about
  its future.
- If you're looking for a standalone, self-hosted search index for your company
  website, check out [sonic](https://journal.valeriansaliou.name/announcing-sonic-a-super-light-alternative-to-elasticsearch/).

## Try it!

The code for [tinysearch is on Github](https://github.com/mre/tinysearch).

Fair warning: the compile times are abysmal at the moment, mainly because I
don’t know how to optimize that part. If you have an idea, feel free to add it
to [this issue](https://github.com/mre/tinysearch/issues/12).

The final Wasm code is laser-fast because we save the round trips to a
search-server. The instant feedback loop feels more like filtering a list than
searching through files.

## Credits

Thanks to [Jorge Luis Betancourt](https://github.com/jorgelbg/),
[mh84](https://github.com/mh84), and [Schalk
Neethling](https://github.com/schalkneethling) for their code contributions and
to [Esteban Barrios](https://github.com/ebarriosjr), [Simon Br&uuml;ggen](https://github.com/m3t0r) and [Luca
Pizzamiglio](https://github.com/pizzamig) for reviewing drafts of this article.

[jekyll]: https://github.com/mre/mre.github.io.v1
[cobalt]: https://github.com/mre/mre.github.io.v2
[zola]: https://www.getzola.org/
[google]: https://cse.google.com/cse/
[algolia]: https://www.algolia.com/
[lunr.js]: https://lunrjs.com/
[elasticlunr]: http://elasticlunr.com/
[stavros]: https://www.stavros.io/posts/bloom-filter-search-engine/
[webassembly]: https://webassembly.org/
[wasm-pack]: https://github.com/rustwasm/wasm-pack
