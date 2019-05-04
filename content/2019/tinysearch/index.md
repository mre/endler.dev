+++
title="A Tiny, Static Search Engine using Rust and WebAssembly"
date=2019-04-07
draft=true
+++

Static site generators have always fascinated me.
They combine content and layout into static HTML without sacrificing performance.

This website has been running on [Jekyll], [Cobalt.rs], and [Zola] over the years and I'm very happy with my setup. Except I always disliked the fact that static websites didn't use "static search engines", too.
Instead, they use [custom Google searches][google], dedicated search engines like [Algolia], or JavaScript based search engines like [lunr.js] or [elasticlunr].

That works well for most people, but I never liked any of that.
I didn't want to add another dependency to Google to my blog, neither did I want to use a heavy web-backend like Algolia. 

On top of that, I'm not a huge fan of JavaScript-heavy websites.
Just the search indices that lunr and elasticlunr create can be multiple megabytes big. That feels bloated - even for today's standards.

As a result, I didn't have any search functionality on my page for the most part.
That's a shame, because with a growing number of articles, it gets harder and harder to find relevant content.

## The idea

Many years back in 2013, I read [Writing a full-text search engine using Bloom filters][stavros] and it was a revelation.

The idea was simple:
Run all articles through a generator that creates a tiny, self-contained search index using a magical datastructure called ✨Bloom Filters✨.

A Bloom Filter doesn't store the words themselves, it just tells us if they were likely inserted. In other words, it can say with a certain *error rate* that a word is in an article. 

Here's the Python code from the original article that generates the bloom filters for each post (courtesy of [Stavros Korokithakis](https://www.stavros.io)):

```python
filters = {}
for name, words in split_posts.items():
    filters[name] = BloomFilter(capacity=len(words), error_rate=0.1)
    for word in words:
        filters[name].add(word)
```

Because of this small error margin, the memory usage is extremely small.

After seeing this, I knew that I wanted something like this for my homepage.
My idea was to directly ship the bloom filters and the search code to the browser.
I'd serve small, static search engine without any backend hosting costs.

## Headaches

The disillusionment came quickly.

I had no idea how to bundle and minimize the generated bloom filters, let along run them on the clients.
Remember that in 2013 NPM was three years old and WebPack was just one.
Also, I didn't feel confident enough in JavaScript to pull this off.

Unsure what to do next, my idea remained a pipe dream.

## A new hope

It's 2019 now and the web is now a different place. Web bundlers are now mature and the Node ecosystem is flourishing.
But one thing in particular has revived my dreams about the tiny static search engine: [WebAssembly].

> WebAssembly (abbreviated Wasm) is a binary instruction format for a stack-based virtual machine. Wasm is designed as a portable target for compilation of high-level languages like C/C++/Rust, enabling deployment on the web for client and server applications. [[source][WebAssembly]]

This meant that I could use a language that I was more familiar with - Rustlang!


zero cost abstractions



Whoops! I shipped some Rust to your Browser.






This is still the wild west:
unstable features, nightly rust, documentation gets outdated almost every day.
I love it!


It's not faster, but I'm more familiar with Rust than JavaScript. That's why I did that.

## Future steps

https://github.com/fitzgen/bumpalo


[Jekyll]: https://github.com/mre/mre.github.io.v1
[Cobalt]: https://github.com/mre/mre.github.io.v2
[Zola]: https://www.getzola.org/
[google]: https://cse.google.com/cse/
[Algolia]: https://www.algolia.com/
[lunr.js]: https://lunrjs.com/
[elaticlunr]: http://elasticlunr.com/
[stavros]: https://www.stavros.io/posts/bloom-filter-search-engine/
[WebAssembly]: https://webassembly.org/