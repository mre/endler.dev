+++
title = "Tips for Faster Rust Compile Times"
date = 2020-06-21
updated=2021-04-28
[taxonomies]
tags=["rust"]
[extra]
comments = [
  {name = "Reddit", url = "https://www.reddit.com/r/rust/comments/hdb5m4/tips_for_faster_rust_compile_times/"},
  {name = "Twitter", url = "https://twitter.com/matthiasendler/status/1274703741485223936"}
]
credits = [
  {name = "Luca Pizzamiglio", url= "https://github.com/pizzamig"},
  {name = "DocWilco", url= "https://twitter.com/drwilco"},
  {name = "Hendrik Maus", url= "https://github.com/hendrikmaus"},
]
+++

When it comes to runtime performance, Rust is one of the fastest guns in the
west. 🔫 It is [on par with the likes of C and
C++](https://benchmarksgame-team.pages.debian.net/benchmarksgame/which-programs-are-fastest.html)
and sometimes even surpasses those. Compile times, however? That's another story.

Below is a list of **tips and tricks on how to make your Rust project compile
faster today**. They are roughly ordered by practicality, so start at the top
and work your way down until you're happy and your compiler goes brrrrrrr.

{% info() %}
✨**WOW!** This article blew up lately.✨‍

I don't run any ads on my blog, but if this information is helping you, please
consider [sponsoring me on Github](https://github.com/sponsors/mre/).
This allows me to write more content in the future.

If you're interested in hands-on Rust consulting, [pick a date from my
calendar](https://booktime.xyz/p/matthias).
**I can help you with performance problems and reducing your build times.**
{% end %}

## Full List Of Tips

- [Update The Rust Compiler And Toolchain](#update-the-rust-compiler-and-toolchain)
- [Use Cargo Check Instead Of Cargo Build](#use-cargo-check-instead-of-cargo-build)
- [Use Rust Analyzer Instead Of Rust Language Server](#use-rust-analyzer-instead-of-rust-language-server-rls)
- [Remove Unused Dependencies](#remove-unused-dependencies)
- [Update Remaining Dependencies](#update-remaining-dependencies)
- [Replace Heavy Dependencies](#replace-heavy-dependencies)
- [Use Cargo Workspaces](#use-cargo-workspaces)
- [Combine All Integration Tests In A Single Binary](#combine-all-integration-tests-in-a-single-binary)
- [Disable Unused Features Of Crate Dependencies](#disable-unused-features-of-crate-dependencies)
- [Use A Ramdisk For Compilation](#use-a-ramdisk-for-compilation)
- [Cache Dependencies With Sccache](#cache-dependencies-with-sccache)
- [Cranelift &ndash; The Alternative Rust Compiler](#cranelift-the-alternative-rust-compiler)
- [Switch To A Faster Linker](#switch-to-a-faster-linker)
- [Faster Incremental Debug Builds On macOS](#faster-incremental-debug-builds-on-macos)
- [Tweak More Codegen Options Compiler Flags](#tweak-more-codegen-options-compiler-flags)
- [Profile Compile Times](#profile-compile-times)
- [Avoid Procedural Macro Crates](#avoid-procedural-macro-crates)
- [Compile On A Beefy Machine](#get-dedicated-hardware)
- [Compile in the Cloud](#compile-in-the-cloud)
- [Download All The Crates](#download-all-the-crates)
- [Bonus: Speed Up Rust Docker Builds Whale](#bonus-speed-up-rust-docker-builds-whale)
- [Drastic Measures: Overclock Your Cpu Fire](#drastic-measures-overclock-your-cpu-fire)
- [Upstream Work](#upstream-work)
- [Help Others Upload Leaner Crates For Faster Build Times](#help-others-upload-leaner-crates-for-faster-build-times)
- [More Resources](#more-resources)
- [What's Next](#what-s-next)

## Why Is Rust Compilation Slow?

Wait a sec, _slow in comparison to what_? That is, if you compare Rust with Go,
the Go compiler is doing a lot less work in general. For example, it lacks support for
generics and macros. On top of that, the Go compiler was [built from
scratch](https://golang.org/doc/faq#What_compiler_technology_is_used_to_build_the_compilers)
as a monolithic toolchain consisting of both, the frontend and the backend (rather
than relying on, say, [LLVM](https://llvm.org/) to take over the backend part,
which is the case for Rust or Swift). This has advantages (more flexibility when
tweaking the entire compilation process, yay) and disadvantages (higher overall maintenance cost
and fewer supported architectures).

In general, **comparing across different programming languages makes little sense**
and overall, the Rust compiler is legitimately doing a great job.
That said, above a certain project size, the compile times are... let's just say
they could be better.

## Why Bother?

According to the [Rust 2019
survey](https://blog.rust-lang.org/2020/04/17/Rust-survey-2019.html), improving
compile times is #4 on the Rust wishlist:

{{ figure(src="rust-survey.svg",
caption="Rust Survey results 2019. (<a href='https://xkcd.com/303/'>Obligatory xkcd</a>.)") }}

## Compile-Time vs Runtime Performance

> As is often cautioned in debates among their designers, programming language
> design is full of tradeoffs. One of those fundamental tradeoffs is runtime
> performance vs. compile-time performance, and the Rust team nearly always (if
> not always) chose runtime over compile-time.  
> &mdash; [Brian Anderson](https://pingcap.com/blog/rust-compilation-model-calamity/)

Overall, there are a few features and design decisions that limit Rust
compilation speed:

- **Macros**: Code generation with macros can be quite expensive.
- **Type checking**
- **Monomorphization**: this is the process of generating specialized versions
  of generic functions. E.g., a function that takes an `Into<String>` gets
  converted into one that takes a `String` and one that takes a `&str`.
- **LLVM**: that's the default compiler backend for Rust, where a lot of the
  heavy-lifting (like code-optimizations) takes place. LLVM is [notorious for
  being slow](https://nikic.github.io/2020/05/10/Make-LLVM-fast-again.html).
- **Linking**: Strictly speaking, this is not part of compiling but happens
  right after. It "connects" your Rust binary with the system libraries. `cargo`
  does not explicitly mark the linking step, so many people add it to the
  overall compilation time.

If you're interested in all the gory details, check out [this blog
post](https://pingcap.com/blog/rust-compilation-model-calamity/) by Brian
Anderson.

## Update The Rust Compiler And Toolchain

Making the Rust compiler faster is an ongoing process, and many fearless people
are [working on
it](https://blog.mozilla.org/nnethercote/2020/04/24/how-to-speed-up-the-rust-compiler-in-2020/).
Thanks to their hard work, compiler speed has improved [30-40% across the board
year-to-date, with some projects seeing up to 45%+ improvements](https://www.reddit.com/r/rust/comments/cezxjn/compiler_speed_has_improved_3040_across_the_board/).

So make sure you use the latest Rust version:

```
rustup update
```

On top of that, Rust tracks compile regressions on a [website dedicated to
performance](https://perf.rust-lang.org/). Work is also put into [optimizing
the LLVM backend](https://nikic.github.io/2020/05/10/Make-LLVM-fast-again.html).
Rumor has it that there's still a lot of low-hanging fruit. 🍇

## Use `cargo check` Instead Of `cargo build`

Most of the time, you don't even have to _compile_ your project at all; you just
want to know if you messed up somewhere. Whenever you can, **skip compilation
altogether**. What you need instead is laser-fast code linting, type- and
borrow-checking.

For that, cargo has a special treat for you: ✨ `cargo check` ✨. Consider the
differences in the number of instructions between `cargo check` on the left and
`cargo debug` in the middle. (Pay attention to the different scales.)

{{ figure(src="cargo-check.jpg", caption="Speedup factors: check 1, debug 5, opt 20") }}

A sweet trick I use is to run it in the background with [`cargo watch`](https://github.com/passcod/cargo-watch). This way, it will `cargo check`
whenever you change a file.

⭐ **Pro-tip**: Use `cargo watch -c` to clear the screen before every run.

## Use Rust Analyzer Instead Of Rust Language Server (RLS)

Another quick way to check if you set the codebase on fire is to use a "language
server". That's basically a "linter as a service", that runs next to your
editor.

For a long time, the default choice here was
[RLS](https://github.com/rust-lang/rls), but lately, folks moved over to
[rust-analyzer](https://github.com/rust-analyzer/rust-analyzer), because it's
more feature-complete and way more snappy. It supports all major IDEs.
Switching to that alone might save your day.

## Remove Unused Dependencies

So let's say you tried all of the above and find that compilation is still slow.
What now?

Dependencies sometimes become obsolete thanks to refactoring. From time to time
it helps to check if all of them are still needed to save compile time.

If this is your own project (or a project you like to contribute to), do a quick
check if you can toss anything with
[cargo-udeps](https://github.com/est31/cargo-udeps):

```bash
cargo install cargo-udeps && cargo +nightly udeps
```

## Update Remaining Dependencies

Next, update your dependencies, because they themselves could have tidied up
their dependency tree lately.

Take a deep dive with
[`cargo-outdated`](https://github.com/kbknapp/cargo-outdated) or `cargo tree`
(built right into cargo itself) to find any outdated dependencies. On top of
that, use [`cargo audit`](https://github.com/RustSec/cargo-audit) to get
notified about any vulnerabilities which need to be addressed, or deprecated
crates which need a replacement.

Here's a nice workflow that I learned from [/u/oherrala on
Reddit](https://www.reddit.com/r/rust/comments/gi7v2v/is_it_wrong_of_me_to_think_that_rust_crates_have/fqe848y):

1. Run `cargo update` to update to the latest [semver](https://semver.org/)
   compatible version.
2. Run `cargo outdated -wR` to find newer, possibly incompatible dependencies.
   Update those and fix code as needed.
3. Find duplicate versions of a dependency and figure out
   where they come from: `cargo tree --duplicate` shows dependencies which come in multiple versions.  
   (Thanks to /u/dbdr for [pointing this out](https://www.reddit.com/r/rust/comments/hdb5m4/tips_for_faster_rust_compile_times/fvm1r2w/).)

⭐ **Pro-tip**: Step 3 is a great way to contribute back to the community! Clone
the repository and execute steps 1 and 2. Finally, send a pull request to the
maintainers.

## Replace Heavy Dependencies

From time to time, it helps to shop around for more lightweight alternatives to
popular crates.

Again, `cargo tree` is your friend here to help you understand which of your
dependencies are quite _heavy_: they require many other crates, cause
excessive network I/O and slow down your build. Then search for lighter
alternatives.

Also, [`cargo-bloat`](https://github.com/RazrFalcon/cargo-bloat) has a `--time`
flag that shows you the per-crate build time. Very handy!

Here are a few examples:

- Using [serde](https://github.com/serde-rs/serde)? Check out
  [miniserde](https://github.com/dtolnay/miniserde) and maybe even
  [nanoserde](https://github.com/not-fl3/nanoserde).
- [reqwests](https://github.com/seanmonstar/reqwest) is quite heavy. Maybe try
  [attohttpc](https://github.com/sbstp/attohttpc) or [ureq](https://github.com/algesten/ureq), which are more lightweight.
- ~~[tokio](https://github.com/tokio-rs/tokio) dragging you down? How about [smol](https://github.com/stjepang/smol)?~~  
  (Edit: This won't help much with build times. [More info in this discussion on Reddit](https://www.reddit.com/r/rust/comments/hdb5m4/tips_for_faster_rust_compile_times/fvmayvh/))
- Swap out [clap](https://github.com/clap-rs/clap) with [pico-args](https://github.com/RazrFalcon/pico-args) if you only need basic argument parsing.

Here's an example where switching crates reduced compile times [from 2:22min to
26
seconds](https://blog.kodewerx.org/2020/06/the-rust-compiler-isnt-slow-we-are.html).

## Use Cargo Workspaces

Cargo has that neat feature called _workspaces_, which allow you to split one
big crate into multiple smaller ones. This code-splitting is great for avoiding
repetitive compilation because only crates with changes have to be recompiled.
Bigger projects like
[servo](https://github.com/servo/servo/blob/master/Cargo.toml) and
[vector](https://github.com/timberio/vector/blob/1629f7f82e459ae87f699e931ca2b89b9080cfde/Cargo.toml#L28-L34)
are using workspaces heavily to slim down compile times.
[Learn more about workspaces here](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html).

## Combine All Integration Tests In A Single Binary

Have any [integration tests](https://doc.rust-lang.org/rust-by-example/testing/integration_testing.html)? (These are the ones in your `tests`
folder.)
Did you know that the Rust compiler will create a binary for every single one of them?
And every binary will have to be linked individually.
This can take most of your build time because linking is slooow. 🐢
The reason is that many system linkers (like `ld`) are [single
threaded](https://stackoverflow.com/questions/5142753/can-gcc-use-multiple-cores-when-linking).

{% info() %}
👨‍🍳️💡‍️ A [linker](<https://en.wikipedia.org/wiki/Linker_(computing)>) is a tool that combines the
output of a compiler and mashes that into one executable you can run.
{% end %}

To make the linker's job a little easier, you can put all your tests in one
crate. (Basically create a `main.rs` in your test folder and add your
test files as `mod` in there.)

Then the linker will go ahead and build a single binary only. Sounds nice, but
careful: it's still a trade-off as you'll need to expose your internal types and
functions (i.e. make them `pub`).

Might be worth a try, though because a recent [benchmark revealed a 1.9x
speedup](https://azriel.im/will/2019/10/08/dev-time-optimization-part-1-1.9x-speedup-65-less-disk-usage/) for one project.

_This tip was brought to you by [Luca Palmieri](https://twitter.com/algo_luca),
[Lucio Franco](https://twitter.com/lucio_d_franco), and [Azriel
Hoh](https://twitter.com/im_azriel). Thanks!_

## Disable Unused Features Of Crate Dependencies

⚠️ **Fair warning**: it seems that switching off features doesn't always improve
compile time. (See [tikv's experiences
here](https://github.com/tikv/tikv/pull/4453#issuecomment-481789292).)

Check the feature flags of your dependencies. A lot of library maintainers take
the effort to split their crate into separate features that can be toggled off
on demand. Maybe you don't need all the default functionality from every crate?

For example, `tokio` has [a ton of
features](https://github.com/tokio-rs/tokio/blob/2bc6bc14a82dc4c8d447521005e044028ae199fe/tokio/Cargo.toml#L26-L91)
that you can disable if not needed.

A quick way to list all features of a crate is
`[cargo-feature-set](https://github.com/badboy/cargo-feature-set)`.

Admittedly, [features are not very discoverable at the
moment](https://twitter.com/llogiq/status/1273875653822222337) because there is
no standard way to document them, but we'll get there eventually.

## Use A Ramdisk For Compilation

When starting to compile heavy projects, I noticed that I was throttled on I/O.
The reason was that I kept my projects on a measly HDD. A more performant
alternative would be SSDs, but if that's not an option, don't throw in the
sponge just yet.

Ramdisks to the rescue! These are like "virtual harddisks" that live in system
memory.

User [moschroe_de](https://www.reddit.com/user/moschroe_de/) shared the
following snippet [over on
Reddit](https://www.reddit.com/r/rust/comments/chqu4c/building_a_computer_for_fastest_possible_rust/ev02hqy),
which creates a ramdisk for your current Rust project (on Linux):

```bash
mkdir -p target && \
sudo mount -t tmpfs none ./target && \
cat /proc/mounts | grep "$(pwd)" | sudo tee -a /etc/fstab
```

On macOS, you could probably do something similar with [this
script](https://gist.github.com/koshigoe/822455). I haven't tried that myself,
though.

## Cache Dependencies With sccache

Another neat project is [sccache](https://github.com/mozilla/sccache) by
Mozilla, which caches compiled crates to avoid repeated compilation.

I had this running on my laptop for a while, but the benefit was rather
negligible, to be honest. It works best if you work on a lot of independent
projects that share dependencies (in the same version). A common use-case is
shared build servers.

## Cranelift &ndash; The Alternative Rust Compiler

Lately, I was excited to hear that the Rust project is using an alternative
compiler that runs in parallel with `rustc` for every CI build:
[Cranelift](https://github.com/bjorn3/rustc_codegen_cranelift), also called
`CG_CLIF`.

Here is a comparison between `rustc` and Cranelift for some popular crates (blue
means better):

{{ figure(src="cranelift.jpg",
caption="LLVM compile time comparison between rustc and cranelift in favor of cranelift") }}

Somewhat unbelieving, I tried to compile
[vector](https://github.com/timberio/vector) with both compilers.

The results were astonishing:

- Rustc: **5m 45s**
- Cranelift: **3m 13s**

I could really notice the difference! What's cool about this is that it creates
fully working executable binaries. They won't be optimized as much, but they are
great for local development.

A more detailed write-up is on [Jason Williams'
page](https://jason-williams.co.uk/a-possible-new-backend-for-rust), and the
project code is [on Github](https://github.com/bjorn3/rustc_codegen_cranelift).

## Switch To A Faster Linker

> The thing that nobody seems to target is linking time. For me, when using
> something with a big dependency tree like Amethyst, for example linking time
> on my fairly recent Ryzen 7 1700 is ~10s each time, even if I change only some
> minute detail only in my code. &mdash; [/u/Almindor on
> Reddit](https://www.reddit.com/r/rust/comments/chqu4c/building_a_computer_for_fastest_possible_rust/euycz74)

According to the [official documentation](https://lld.llvm.org/), "LLD is a
linker from the LLVM project that is a drop-in replacement for system linkers
and runs much faster than them. [..] When you link a large program on a
multicore machine, you can expect that LLD runs more than twice as fast as the
GNU gold linker. Your mileage may vary, though."

If you're on Linux you can switch to `lld` [like
so](https://stackoverflow.com/a/57817848/270334):

```toml
[target.x86_64-unknown-linux-gnu]
rustflags = [
    "-C", "link-arg=-fuse-ld=lld",
]
```

A word of caution: `lld` might not be working on all platforms yet. At least on
macOS, Rust support seems to be broken at the moment, and the work on fixing it
has stalled (see
[rust-lang/rust#39915](https://github.com/rust-lang/rust/issues/39915)).

**Update**: I recently learned about another linker called [mold](https://github.com/rui314/mold), which claims a massive 12x performance bump over lld. Compared to GNU gold, it's said to be more than 50x. Would be great if anyone could verify and send me a message.

**Update II**: Aaand another one called [zld](https://github.com/michaeleisel/zld), which is a drop-in replacement for Apple's `ld` linker and is targeting debug builds. [[Source](https://www.reddit.com/r/rust/comments/lv3eb2/hey_rustaceans_got_an_easy_question_ask_here_92021/gppyutx)]

{{ figure(src="zld_benchmark.svg", caption="The zld benchmarks are quite impressive.", link="https://github.com/michaeleisel/zld")}}

Which one you want to choose depends on your requirements. Which platforms do
you need to support? Is it just for local testing or for production usage?

## Faster Incremental Debug Builds On Macos

Rust 1.51 added an interesting flag for faster incremental debug builds on
macOS. It can make debug builds up to seconds faster (depending on your use-case).
Just add this to your `Cargo.toml`:

```toml
[profile.dev]
split-debuginfo = "unpacked"
```

Some engineers [report](https://jakedeichert.com/blog/reducing-rust-incremental-compilation-times-on-macos-by-70-percent/) that this flag alone reduces compilation times on macOS by **70%**.

The flag might become the standard for macOS soon. It is already the [default
on nightly](https://github.com/rust-lang/cargo/pull/9298).

## Tweak More Codegen Options / Compiler Flags

Rust comes with a huge set of [settings for code
generation](https://doc.rust-lang.org/rustc/codegen-options). It can help to
look through the list and tweak the parameters for your project.

There are **many** gems in the [full list of codegen
options](https://doc.rust-lang.org/rustc/codegen-options). For inspiration,
here's [bevy's config for faster
compilation](https://github.com/bevyengine/bevy/blob/3a2a68852c0a1298c0678a47adc59adebe259a6f/.cargo/config_fast_builds).

## Profile Compile Times

If you like to dig deeper, Rust compilation can be profiled with [`cargo rustc -- -Zself-profile`](https://blog.rust-lang.org/inside-rust/2020/02/25/intro-rustc-self-profile.html#profiling-the-compiler).
The resulting trace file can be visualized with a flamegraph or the Chromium
profiler:

{{ figure(src="chrome_profiler.jpg", caption="Image of Chrome profiler with all crates", credits="Rust Lang Blog") }}

There's also a [`cargo -Z timings`](https://doc.rust-lang.org/nightly/cargo/reference/unstable.html#timings)
feature that gives some information about how long each compilation step takes,
and tracks concurrency information over time.

Another golden one is
[`cargo-llvm-lines`](https://github.com/dtolnay/cargo-llvm-lines), which shows
the number of lines generated and objects copied in the LLVM backend:

```
$ cargo llvm-lines | head -20

  Lines        Copies         Function name
  -----        ------         -------------
  30737 (100%)   1107 (100%)  (TOTAL)
   1395 (4.5%)     83 (7.5%)  core::ptr::drop_in_place
    760 (2.5%)      2 (0.2%)  alloc::slice::merge_sort
    734 (2.4%)      2 (0.2%)  alloc::raw_vec::RawVec<T,A>::reserve_internal
    666 (2.2%)      1 (0.1%)  cargo_llvm_lines::count_lines
    490 (1.6%)      1 (0.1%)  <std::process::Command as cargo_llvm_lines::PipeTo>::pipe_to
    476 (1.5%)      6 (0.5%)  core::result::Result<T,E>::map
    440 (1.4%)      1 (0.1%)  cargo_llvm_lines::read_llvm_ir
    422 (1.4%)      2 (0.2%)  alloc::slice::merge
    399 (1.3%)      4 (0.4%)  alloc::vec::Vec<T>::extend_desugared
    388 (1.3%)      2 (0.2%)  alloc::slice::insert_head
    366 (1.2%)      5 (0.5%)  core::option::Option<T>::map
    304 (1.0%)      6 (0.5%)  alloc::alloc::box_free
    296 (1.0%)      4 (0.4%)  core::result::Result<T,E>::map_err
    295 (1.0%)      1 (0.1%)  cargo_llvm_lines::wrap_args
    291 (0.9%)      1 (0.1%)  core::char::methods::<impl char>::encode_utf8
    286 (0.9%)      1 (0.1%)  cargo_llvm_lines::run_cargo_rustc
    284 (0.9%)      4 (0.4%)  core::option::Option<T>::ok_or_else
```

## Avoid Procedural Macro Crates

Procedural macros are the hot sauce of Rust development: they burn through CPU
cycles so use with care ~~(keyword: monomorphization)~~.

**Update**: Over [on Twitter](https://twitter.com/ManishEarth/status/1308059185335037952)
[Manish](https://twitter.com/ManishEarth) pointed out that "the reason proc macros
are slow is that the (excellent) proc macro infrastructure &ndash; [`syn`](https://github.com/dtolnay/syn) and friends &ndash; are slow to compile. Using proc macros themselves does not have a huge impact on compile times."
(This might [change in the future](https://twitter.com/CryZe107/status/1308059769362677760).)

Manish goes on to say

> This basically means that if you use one proc macro, the marginal compile time
> cost of adding additional proc macros is insignificant. A lot of people end up
> needing serde in their deptree anyway, so if you are forced to use serde, you
> should not care about proc macros.
>
> If you are not forced to use serde, one thing a lot of folks do is have
> `serde` be an optional dependency so that their types are still serializable
> if necessary.

If you heavily use procedural macros in your project (e.g., if you use serde),
you can try to sidestep their impact on compile times with
[watt](https://github.com/dtolnay/watt), a tool that offloads macro compilation
to Webassembly.

From the docs:

> By compiling macros ahead-of-time to Wasm, we save all downstream users of the
> macro from having to compile the macro logic or its dependencies themselves.
>
> Instead, what they compile is a small self-contained Wasm runtime (~3 seconds,
> shared by all macros) and a tiny proc macro shim for each macro crate to hand
> off Wasm bytecode into the Watt runtime (~0.3 seconds per proc-macro crate you
> depend on). This is much less than the 20+ seconds it can take to compile
> complex procedural macros and their dependencies.

Note that this crate is still experimental.

(Oh, and did I mention that both, `watt` and `cargo-llvm-lines` were built by
[David Tolnay](https://github.com/dtolnay/), who is a frickin' steamroller of an
engineer?)

## Get Dedicated Hardware

If you reached this point, the easiest way to improve compile times even more is
probably to spend money on top-of-the-line hardware.

Perhaps a bit surprisingly, the fastest machines for Rust compiles seem to be _Apple machines with a M1 chip_:

{{ figure(src="tweet.png", link="https://twitter.com/rikarends/status/1328598935380910082"
caption="Rik Arends on Twitter") }}

The [new 13 inch Macbook Pro laptop](https://amzn.to/3tSrsCs) has 16 hours of battery life, which is ridiculous; and the price is comparably low, given the compute power you'd get.

If you prefer a desktop machine, the [new Mac Mini](https://amzn.to/3tSrsCs) has the same M1 processor for about half the price and people reported that it's a beast.

If you rather like to stick to Linux, people also had great success with a multicore CPU like an [AMD Ryzen
Threadripper and 32 GB of RAM](https://www.reddit.com/r/rust/comments/chqu4c/building_a_computer_for_fastest_possible_rust/).

On portable devices, compiling can drain your battery and be slow. To avoid
that, I'm using my machine at home, a 6-core AMD FX 6300 with 12GB RAM, as a
build machine. I can use it in combination with [Visual Studio Code Remote
Development](https://code.visualstudio.com/docs/remote/remote-overview).

## Compile in the Cloud

If you don't have a dedicated machine yourself, you can offload the compilation
process to the cloud instead.  
[Gitpod.io](https://gitpod.io/) is superb for testing a cloud build as they
provide you with a beefy machine (currently 16 core Intel Xeon 2.80GHz, 60GB
RAM) for free during a limited period. Simply add `https://gitpod.io/#` in
front of any Github URL.
[Here is an example](https://gitpod.io/#https://github.com/hello-rust/show/tree/master/episode/9) for one of my [Hello Rust](https://hello-rust.show/) episodes.

Gitpod has a neat feature called [prebuilds](https://www.gitpod.io/docs/prebuilds). From their docs:

> Whenever your code changes (e.g. when new commits are pushed to your
> repository), Gitpod can prebuild workspaces.
> Then, when you do create a new workspace on a branch, or Pull/Merge Request,
> for which a prebuild exists, this workspace will load much faster, because **all
> dependencies will have been already downloaded ahead of time, and your code
> will be already compiled**.

Especially when reviewing pull requests, this could give you a nice speedup.
Prebuilds are quite customizable; take a look at the [`.gitpod.yml` config of
nushell](https://github.com/nushell/nushell/blob/main/.gitpod.yml) to get an
idea.

## Download ALL The Crates

If you have a slow internet connection, a big part of the initial build
process is fetching all those shiny crates from crates.io. To mitigate that,
you can download **all** crates in advance to have them cached locally.
[criner](https://github.com/the-lean-crate/criner) does just that:

```
git clone https://github.com/the-lean-crate/criner
cd criner
cargo run --release -- mine
```

The archive size is surprisingly reasonable, with roughly **50GB of required disk
space** (as of today).

## Bonus: Speed Up Rust Docker Builds 🐳

Building Docker images from your Rust code?
These can be notoriously slow, because cargo doesn't support building only a
project's dependencies yet, invalidating the Docker cache with every build if you
don't pay attention.
[`cargo-chef`](https://www.lpalmieri.com/posts/fast-rust-docker-builds/) to the
rescue! ⚡

> `cargo-chef` can be used to fully leverage Docker layer caching, therefore
> massively speeding up Docker builds for Rust projects. On our commercial
> codebase (~14k lines of code, ~500 dependencies) we measured a **5x speed-up**: we
> cut Docker build times from **~10 minutes to ~2 minutes.**

Here is an example Dockerfile if you're interested:

```Dockerfile
# Step 1: Compute a recipe file
FROM rust as planner
WORKDIR app
RUN cargo install cargo-chef
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Step 2: Cache project dependencies
FROM rust as cacher
WORKDIR app
RUN cargo install cargo-chef
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Step 3: Build the binary
FROM rust as builder
WORKDIR app
COPY . .
# Copy over the cached dependencies from above
COPY --from=cacher /app/target target
COPY --from=cacher /usr/local/cargo /usr/local/cargo
RUN cargo build --release --bin app

# Step 4:
# Create a tiny output image.
# It only contains our final binary.
FROM rust as runtime
WORKDIR app
COPY --from=builder /app/target/release/app /usr/local/bin
ENTRYPOINT ["./usr/local/bin/app"]
```

[`cargo-chef`](https://github.com/LukeMathWalker/cargo-chef) can help speed up
your continuous integration with Github Actions or your deployment process to Google
Cloud.

## Drastic Measures: Overclock Your CPU? 🔥

<details>
  <summary>
    ⚠️ Warning: You can damage your hardware if you don't know what you are doing.
    Proceed at your own risk.
  </summary>

Here's an idea for the desperate. Now I don't recommend that to everyone, but
if you have a standalone desktop computer with a decent CPU, this might be a way
to squeeze out the last bits of performance.

Even though the Rust compiler executes a lot of steps in parallel,
single-threaded performance is still quite relevant.

As a somewhat drastic measure, you can try to overclock your CPU. [Here's a
tutorial for my processor](https://www.youtube.com/watch?v=gb1QDpRnOvw). (I owe
you some benchmarks from my machine.)

</details>

## Upstream Work

Making the Rust compiler faster is an ongoing process, and many fearless people
are [working on
it](https://blog.mozilla.org/nnethercote/2020/04/24/how-to-speed-up-the-rust-compiler-in-2020/).
Thanks to their hard work, compiler speed has improved [30-40% across the board
year-to-date, with some projects seeing up to 45%+ improvements](https://www.reddit.com/r/rust/comments/cezxjn/compiler_speed_has_improved_3040_across_the_board/).
On top of that, Rust tracks compile regressions on a [website dedicated to
performance](https://perf.rust-lang.org/)

Work is also put into [optimizing the LLVM
backend](https://nikic.github.io/2020/05/10/Make-LLVM-fast-again.html). Rumor
has it that there's still a lot of low-hanging fruit. 🍇

The Rust team is also continuously working to make the compiler faster.
Here's an extract of the [2020 survey](https://blog.rust-lang.org/2020/12/16/rust-survey-2020.html#compile-times):

> One continuing topic of importance to the Rust community and the Rust team is
> improving compile times. Progress has already been made with **50.5% of
> respondents saying they felt compile times have improved**. This improvement was
> particularly pronounced with respondents with large codebases (10,000 lines of
> code or more) where 62.6% citing improvement and only 2.9% saying they have
> gotten worse. Improving compile times is likely to be the source of
> significant effort in 2021, so stay tuned!

## Help Others: Upload Leaner Crates For Faster Build Times

[`cargo-diet`](https://github.com/the-lean-crate/cargo-diet) helps you build
lean crates that significantly reduce download size (sometimes by 98%). It might
not directly affect your own build time, but your users will surely be thankful. 😊

## More Resources

- [The Rust Perf
  Book](https://nnethercote.github.io/perf-book/compile-times.html) has a
  section on compile times.
- Tons of [articles on performance on Read
  Rust](https://readrust.net/performance).
- [8 Solutions for Troubleshooting Your Rust Build
  Times](https://medium.com/@jondot/8-steps-for-troubleshooting-your-rust-build-times-2ffc965fd13e)
  is a great article by Dotan Nahum that I fully agree with.
- Improving the build times of a bigger Rust project (lemmy) [by
  30%](https://lemmy.ml/post/50089).
- [arewefastyet](https://arewefastyet.rs/) measures how long the Rust compiler
  takes to compile common Rust programs.

## What's Next?

Phew! That was a long list. 😅 If you have any additional tips, please [let me know](https://github.com/mre/mre.github.io/issues).

If compiler performance is something you're interested in, why not [collaborate
on a tool](https://github.com/rust-lang/measureme/issues/51) to see what user code is causing rustc to use lots of
time?

Also, once you're done optimizing your build times, how about optimizing
_runtimes_ next? My friend [Pascal Hertleif](https://twitter.com/killercup/) has a
[nice article](https://deterministic.space/high-performance-rust.html) on that.

{% info() %}

- Consider [sponsoring me on Github](https://github.com/sponsors/mre/) for future articles.
- I can help you with performance problems and reducing your build times. [Reach out here.](https://booktime.xyz/p/matthias)
  {% end %}
