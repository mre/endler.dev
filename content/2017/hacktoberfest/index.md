+++
title="Learn Some Rust During Hacktoberfest"
date=2017-10-15

[extra]
excerpt="October is the perfect time to contribute to Open Source &mdash; at least according to Github and DigitalOcean. Because that's when they organize Hacktoberfest, a global event where you get a free shirt and lots of street cred for creating pull requests."
social_img="2017_hacktoberfest.png"
+++

{{ figure(src="hacktoberfest.svg", caption="Dirndl, Lederhose, Brezn, Beer, Rust" credits="[Designed by Freepik](https://www.freepik.com/free-vector/food-items-oktoberfest-festival_911290.htm)")}} 


October is the perfect time to contribute to Open Source &mdash; at least according to Github and DigitalOcean.
Because that's when they organize Hacktoberfest, a global event where you __get a free shirt and lots of street cred__ for creating pull requests. Read the official announcement [here](https://hacktoberfest.digitalocean.com/).

Some people think they cannot contribute anything of value. Either because they lack the programming skills or because they don't know where to start.

This guide is trying to change that!  

Let me show you, how *everybody* can contribute code to [Rust](https://www.rust-lang.org/), a safe systems programming language.
I was inspired to write this by a [tweet from llogiq](https://twitter.com/llogiq/status/915288482314178560).

## 1. Find a great Rust project to work on

We all want our work to be appreciated.  
Therefore I suggest to start contributing to medium-sized projects, because they gained some momentum but are still driven by a small number of maintainers, so help is always welcome. By contrast, tiny projects are mostly useful to the original author only, while large projects can be intimidating at first and have stricter guidelines.

For now, let's look at repositories with 5-100 stars, which were updated within this year.
Github supports [advanced search options based on Lucene syntax](https://help.github.com/articles/understanding-the-search-syntax). 

```
language:Rust stars:5..100 pushed:>2017-01-01
```

[Here](https://github.com/search?q=language%3ARust+stars%3A5..100+pushed%3A%3E2017-01-01)'s a list of projects, which match this filter.

## 2. Install the Rust toolchain

To start contributing, we need a working Rust compiler and the cargo package manager.
Fortunately, the installation should be straightforward.
I recommend [rustup](https://rustup.rs/) for that.

Run the following command in your terminal, then follow the onscreen instructions.

```
curl https://sh.rustup.rs -sSf | sh
```

If you're unsure, just accept the defaults.
After the installation is done, we also need to get the nightly version of the compiler for later.

```
rustup install nightly
```

Questions so far? Find more detailed installation instructions [here](https://asquera.de/blog/2017-03-03/setting-up-a-rust-devenv/).

## 3. Fork the project and clone it to your computer

First, click on the little *fork* button on the top right of the Github project page. Then clone your fork to your computer. 

```
git clone git@github.com:yourusername/project.git
```

For more detailed instructions, go [here](https://guides.github.com/activities/forking/).

## 4. Does it build?

Before we start modifying the codebase, we should make sure that it is in a workable state.
The following commands should work right away from inside the project folder.

```
cargo build
cargo test
```

If not, you might want to consult the `README` for further instructions. (But feel free to choose another project.)


## 5. The magic sauce

Here's the trick: we use a [linter](https://en.wikipedia.org/wiki/Lint_(software)) called [clippy](https://github.com/rust-lang/rust-clippy) to show us improvement areas in any Rust codebase.

To get clippy, install it like so:

```
cargo +nightly install clippy
```

Afterwards, run it from the project root as often as you like.

```
rustup run nightly cargo clippy
```

This should give you actionable information on how to improve the codebase.

Here's some sample output:

```rust
warning: useless use of `format!`
   --> src/mach/header.rs:420:49
    |
420 |             let error = error::Error::Malformed(format!("bytes size is smaller than an Mach-o header"));
    |                                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    |
    = note: #[warn(useless_format)] on by default
    = help: for further information visit https://rust-lang-nursery.github.io/rust-clippy/v0.0.165/index.html#useless_format

warning: this expression borrows a reference that is immediately dereferenced by the compiler
   --> src/mach/header.rs:423:36
    |
423 |             let magic = mach::peek(&bytes, 0)?;
    |                                    ^^^^^^ help: change this to: `bytes`
    |
    = help: for further information visit https://rust-lang-nursery.github.io/rust-clippy/v0.0.165/index.html#needless_borrow
```

Just try some of the suggestions and see if the project still compiles and the tests still pass.
Check out the links to the documentation in the help section to learn more.
Start small to make your changes easier to review.


## 6. Creating a Pull Request

If you're happy with your changes, now is the time to publish them!
It's best to create a new branch for your changes and then push it to your fork.

```
git checkout -b codestyle
git commit -am "Minor codestyle fixes"
git push --set-upstream origin codestyle
```

Afterwards, go to the homepage of your fork on Github.
There should be a button titled *Compare & pull request*.
Please add a meaningful description and then submit the pull request.

Congratulations! You've contributed to the Rust ecosystem. Thank you! 🎉

## Trophy case

* [m4b/goblin](https://github.com/m4b/goblin/pull/55)
* [fitzgen/cpp_demangle](https://github.com/gimli-rs/cpp_demangle/pull/100)
* [fdehau/tui-rs](https://github.com/fdehau/tui-rs/pull/19)
* [christophertrml/rs-natural](https://github.com/christophertrml/rs-natural/pull/15)

## Bonus!

If all of the manual fixing and checking sounds too dull, you can automate step number 5 using [`rustfix`](https://github.com/killercup/rustfix) by Pascal Hertleif ([@killercup](https://github.com/killercup/)):

```
rustfix --yolo && cargo check
```

