+++
title="A Tiny, Static Search Engine using Rust and WebAssembly"
date=2019-04-07
draft=true
+++

Static site generators have always fascinated me.
They combine content and layout into static HTML without sacrificing performance.

This website has been running on [Jekyll], [Cobalt], and [Zola] over the years and I'm very happy with my setup. Except I always disliked the fact that static websites didn't use "static search engines", too.
Instead, they use [custom Google searches][google], dedicated search engines like [Algolia], or JavaScript based search engines like [lunr.js] or [elasticlunr].

That works well for most sites, but I never liked any of that.  
I didn't want to add yet another dependency to Google, neither did I want to use a stand-alone web-backend like Algolia. 

On top of that, I'm not a huge fan of JavaScript-heavy websites.
For example, just the search indices that lunr creates can be [multiple megabytes big](https://github.com/olivernn/lunr.js/issues/268#issuecomment-304490937).
That feels lavish - even by today's generous bandwidth standards.

As a result, I didn't have any search functionality on my page for a long time.
That's unfortunate, because with a growing number of articles, it gets harder and harder to find relevant content.

## The idea

Many years back in 2013, I read [Writing a full-text search engine using Bloom filters][stavros] &mdash; and it was a revelation.

The idea was simple:
Run all articles through a generator that creates a tiny, self-contained search index using a magical datastructure called a ✨*Bloom Filter* ✨.

A Bloom Filter doesn't store the words themselves, it just tells us if they likely exist. In other words, it can say with a certain *error rate* that a word is in an article. 

Here's the Python code from the original article that generates the bloom filters for each post (courtesy of [Stavros Korokithakis](https://www.stavros.io)):

```python
filters = {}
for name, words in split_posts.items():
    filters[name] = BloomFilter(capacity=len(words), error_rate=0.1)
    for word in words:
        filters[name].add(word)
```

The memory footprint is extremely small thanks to `error_rate`, which allows for a small number of false positives. 

I immediately knew that I wanted something like this for my homepage.
My idea was to directly ship the bloom filters and the search code to the browser.
I could serve a small, static search engine without the need for a backend.

## Headaches

The disillusionment came quickly.

I had no idea how to bundle and minimize the generated bloom filters, let alone run them on the clients.
The original article briefly touches on this:

> You need to implement a Bloom filter algorithm on the client side. This will probably not be much longer than the inverted index search algorithm, but it’s still probably a bit more complicated.

I didn't feel confident enough with JavaScript to pull this off.
Back then in 2013, NPM was three years old and WebPack just turned one, so I also didn't know where to look for existing solutions.

Unsure what to do next, my idea remained a pipe dream.

## A new hope

Five years later, in 2018, the web was a different place. Web bundlers were ubiquitous and the Node ecosystem was flourishing.
One thing in particular revived my dreams about the tiny static search engine: the advent of [WebAssembly].

> WebAssembly (abbreviated Wasm) is a binary instruction format for a stack-based virtual machine. Wasm is designed as a portable target for compilation of high-level languages like C/C++/Rust, enabling deployment on the web for client and server applications. [[source][WebAssembly]]

This meant that I could use a language that I was more familiar with to write the client-side code - Rust!

I started my journey with a [prototype back in January 2018](https://github.com/mre/tinysearch/commit/82c1d36835348718f04c9ca0dd2c1ebf8b19a312).
It was just a direct port of the Python version above:

```rust
let mut filters = HashMap::new();
for (name, words) in split_posts {
  let mut filter: BloomFilter = BloomFilter::with_rate(0.1, words.len() as u32);
  for word in words {
    filter.insert(&word);
  }
  filters.insert(name, filter);
}
```

While I managed to create the bloom filters per article and run searches, I *still* had no clue how to package that up for the web.
...until wasm-pack [came into existence in February 2018](https://github.com/rustwasm/wasm-pack/commit/125431f97eecb6f3ca5122f8b345ba5b7eee94c7). 

## Whoops! I shipped some Rust to your Browser.

Now I finally had all the parts I needed:

* Rust - A language I was comfortable with.
* A working prototype that served as a proof-of-concept.
* [wasm-pack] - A bundler for WebAssembly modules.

There were still a few blockers to get this done.

## Bloom filter

Tried https://github.com/jedisct1/rust-bloom-filter
first, but it didn't implement serialize/deserialize


cuckoofilter:
~/C/p/tinysearch ❯❯❯ l storage
Permissions Size User    Date Modified Name
.rw-r--r--   44k mendler 24 Mar 15:42  storage


# Binary size over time

"Vanilla WASM pack" 216316 

https://github.com/johnthagen/min-sized-rust

"opt-level = 'z'" 249665
"lto = true" 202516
"opt-level = 's'" 195950

 trades off size for speed. It has a tiny code-size footprint, but it is is not competitive in terms of performance with the default global allocator, for example.

"wee_alloc and nightly" 187560
"codegen-units = 1" 183294

```
brew install binaryen
```

"wasm-opt -Oz" 154413

"Remove web-sys as we don't have to bind to the DOM." 152858

clean up other dependencies that I added during testing

"remove structopt" 152910


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


## Analyzing the dehydration part

    pub fn from_bytes(bytes: &[u8]) -> Result<Self, BincodeError> {
        let decoded = bincode::deserialize(bytes)?;
        Ok(Storage {
            filters: Storage::hydrate(decoded),
        })
    }


    results in

```
twiggy top -n 10 dbg/tinysearch_bg.wasm
 Shallow Bytes │ Shallow % │ Item
───────────────┼───────────┼───────────────────────────────────────────────────────────────────────────────────────────────
         36040 ┊    25.62% ┊ data[0]
         14038 ┊     9.98% ┊ "function names" subsection
         10116 ┊     7.19% ┊ std::sync::once::Once::call_once::{{closure}}::h58fa0daaf41a010a
          7313 ┊     5.20% ┊ data[1]
          6888 ┊     4.90% ┊ core::fmt::float::float_to_decimal_common_shortest::hdd201d50dffd0509
          6226 ┊     4.43% ┊ search
          6080 ┊     4.32% ┊ core::fmt::float::float_to_decimal_common_exact::hcb5f56a54ebe7361
          4879 ┊     3.47% ┊ core::num::flt2dec::strategy::dragon::mul_pow10::h1f6e32d33228d12a
          2734 ┊     1.94% ┊ <serde_json::error::Error as serde::ser::Error>::custom::ha35c72a3e1216b8f
          1722 ┊     1.22% ┊ <std::path::Components<'a> as core::iter::traits::iterator::Iterator>::next::hdc7c6ef507797acc
         44531 ┊    31.66% ┊ ... and 464 more.
        140567 ┊    99.93% ┊ Σ [474 Total Rows]
```


    pub fn from_bytes(bytes: &[u8]) -> Result<Self, BincodeError> {
        let decoded = bincode::deserialize(bytes)?;
        Ok(Storage {
            filters: Filters::new()
        })
    }

    results in

```
twiggy top -n 10 dbg/tinysearch_bg.wasm
 Shallow Bytes │ Shallow % │ Item
───────────────┼───────────┼──────────────────────────────────────────────────────────────────────────────────────
         30839 ┊    40.79% ┊ data[0]
          7108 ┊     9.40% ┊ "function names" subsection
          6282 ┊     8.31% ┊ search
          5689 ┊     7.52% ┊ data[1]
          2727 ┊     3.61% ┊ <serde_json::error::Error as serde::ser::Error>::custom::ha35c72a3e1216b8f
          1437 ┊     1.90% ┊ std::sync::once::Once::call_inner::h35f0eda9cf9eca08
          1428 ┊     1.89% ┊ <std::sys_common::poison::PoisonError<T> as core::fmt::Debug>::fmt::h3c1beed6d984aee3
          1217 ┊     1.61% ┊ data[2]
          1182 ┊     1.56% ┊ core::fmt::write::hd4bdd4af2be576da
          1109 ┊     1.47% ┊ core::str::slice_error_fail::ha73ff2fecc9e819b
         16497 ┊    21.82% ┊ ... and 248 more.
         75515 ┊    99.88% ┊ Σ [258 Total Rows]
```






didn't help:
wasm-snip --snip-rust-fmt-code --snip-rust-panicking-code -o pkg/tinysearch_bg_snip.wasm pkg/tinysearch_bg_opt.wasm


# Tips

* This is still the wild west: unstable features, nightly rust, documentation gets outdated almost every day. I love it!
* Rust is very good with removing dead code, so you usually don't pay for unused crates. 
  I would still advise you to be very conservative about the dependencies you add, because it's tempting to add features which you don't need and which will add to the binary size.
  For example, I used Structopt during testing and I had a main function which was parsing these commandline arguments. This was not necessary for WASM, however. So I removed it later.


I understand that not everyone wants to write Rust code. It's complicated to get started with.
The cool thing is, that you can do the same with almost any other language, too. For example, you can write Go code and transpile to WASM or maybe you prefer
PHP or Haskell.

https://github.com/appcypher/awesome-wasm-langs



The message is: the web is for EVERYONE, not just JavaScript programmers.
What was very hard just a two years ago is easy now: shipping code in any language to every browser.
We should make better use of it.


Now the challenge becomes optimizing the index datastructure

* cuckoofilter, all posts 45221 bytes

[GRAPH SHOWING SPACE USAGE WITH DIFFERENT DATASTRUCTURES]

## Frontend

https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_autocomplete

## Lessons learned

A lot of people dismiss WebAssembly as a toy technology.
This cannot be further from the truth.
WebAssembly will revolutionize the way we build web technology.
Whenever there is a new technology, ask yourself: "What changed? What is possible now?".


Stop words
https://gist.github.com/sebleier/554280

Markdown cleanup

Basic scoring

## Future steps

Index word tree

    w (maybe skip that one as every article will have every letter of the alphabet)
    wo
    wor
    word

Find more gems at
https://journal.valeriansaliou.name/announcing-sonic-a-super-light-alternative-to-elasticsearch/

WASM is very powerful. There is no doubt in my mind, that it will transform the web.
It provides just the right abstractions to build fast modules productively.


# References

https://rustwasm.github.io/docs/book/reference/code-size.html




[Jekyll]: https://github.com/mre/mre.github.io.v1
[Cobalt]: https://github.com/mre/mre.github.io.v2
[Zola]: https://www.getzola.org/
[google]: https://cse.google.com/cse/
[Algolia]: https://www.algolia.com/
[lunr.js]: https://lunrjs.com/
[elasticlunr]: http://elasticlunr.com/
[stavros]: https://www.stavros.io/posts/bloom-filter-search-engine/
[WebAssembly]: https://webassembly.org/
[wasm-pack]: https://github.com/rustwasm/wasm-pack

https://stackoverflow.com/questions/867099/bloom-filter-or-cuckoo-hashing
https://www.cs.cmu.edu/~binfan/papers/login_cuckoofilter.pdf
