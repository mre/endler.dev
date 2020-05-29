+++
title = "Faster Rust Compile Times in 2020"
date = 2020-05-29
draft = true
+++

When it comes to runtime performance, Rust is one of the fastest languages out there. It is [on par with the likes of C and C++](https://benchmarksgame-team.pages.debian.net/benchmarksgame/which-programs-are-fastest.html) and sometimes even surpasses them.
However, one of my main drawbacks of its fast runtime are the slow compile times.

For smaller projects, compile times are mostly fine, so if your project builds fast enough there’s nothing to do here.
Starting with medium-sized projects, the compilation costs are starting to become significant.

Improving compilation times is up there at the top of the wishlist for many Rustaceans according to the 2019 survey:

![How can we improhttps://blog.rust-lang.org/2020/04/17/Rust-survey-2019.htmlve Rust for better adoption](https://blog.rust-lang.org/images/2020-03-RustSurvey/45-improve-adoption.svg)

## Why is Rust compilation slow?

The compiler is slow due to a few reasons:

- Macros: Code generation with macros can be quite expensive, so use them with care.
- Type checking
- Monomorphization: this is the process of generating specialized versions of generic functions. E.g. a function that takes an `Into<String>` will be converted into one that takes a `String` and another one that takes a `&str` for example.
- LLVM: that’s the default compiler backend for Rust, where a lot of the heavy-lifting (like code-optimizations) is taking place. LLVM is [notorious for being slow](https://nikic.github.io/2020/05/10/Make-LLVM-fast-again.html).
- Linking: Strictly speaking, this is not part of compiling but happens after. It “connects” your Rust binary with the system libraries. `cargo` does not explicitly mark the linking step, so many people add it to the overall compilation time.

If you’re interested in the details, check out [this blog post](https://pingcap.com/blog/rust-compilation-model-calamity/) by Brian Anderson.

You might be wondering why the Rust compiler is slow in the first place; but first you’d have to ask yourself: “Slow in comparison to what”? If you compare it with Go, their compiler is doing _less_ work in general. For example, it lacks support for generics and powerful code-generation. Also, the Go compiler was built from scratch as a monolithic tool consisting of both, the frontend and the backend (rather than relying on, say, LLVM to take over the backend part in the case of Rust or Swift). This has advantages (more options for tweaking the entire process) and disadvantages (higher maintenance costs and less supported architectures).

## Upstream work

Making the Rust compiler faster is an ongoing process and many smart people are [working on i](https://blog.mozilla.org/nnethercote/2020/04/24/how-to-speed-up-the-rust-compiler-in-2020/)t, but there are still things you can do today to make the experience less painful. (Still painful, but less so.)

And there is improvement:
Compiler speed has improved 30-40% across the board year-to-date, with some projects seeing 45%+ improvements (https://www.reddit.com/r/rust/comments/cezxjn/compiler_speed_has_improved_3040_across_the_board/)

Rust tracks compile regressions on a dashboard here:
https://perf.rust-lang.org/

## Bucket list

But what if you want to improve the situation _today_?

Below I list a few tips on how to make your Rust project compile faster.
They are roughly ordered by relevance, so start at the top and work your way through the list until your satisfied with the compilation times.

## Use `cargo check` instead of `cargo build`

Most of the time you don’t want to compile your project at all; you just want to know if you messed up during refactorings. What you want is code liniting and type checking.
For that, cargo has a special command: `cargo check`.
It runs the compiler's type checking and linting passes but skips code generation and linking. That is what [actually matters](https://wiki.alopex.li/RustCompileTimesAreNotSlow). So whenever you can, use it to skip compilation altogether.

![Speedup factors: check 1, debug 5, opt 20](https://paper-attachments.dropbox.com/s_A57800B62E88AEE36F7155FD549213822584025ACDBC9DAC077AE34BEF6CE532_1590587846423_image.png)

A nice trick is to use `cargo watch` and keep it running on the commandline. This way, it will run `cargo check` whenever you change a file.

## Rust analyzer vs Rust Language Server

Often-times you’re not even interested in a binary output. You just care that your recent modifications didn’t set the codebase on fire. For that, you can use a code-checker like Rust-Analyzer.
rust-analyzer is an implementation of [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) for the [Rust](https://www.rust-lang.org/) programming language. It provides features like completion and goto definition for many code editors, including VS Code, Emacs and Vim.

## What is slowing you down?

So let’s say you _really_ need to compile your project and find that it’s slow. The question is _why_ is it slow?

https://blog.rust-lang.org/inside-rust/2020/02/25/intro-rustc-self-profile.html#profiling-the-compiler

![Image of Chrome profiler with all crates](https://blog.rust-lang.org/images/inside-rust/2020-02-25-intro-rustc-self-profile/chrome_profiler3.png)

There's cargo -Z timings that shows you build times across crates and a self-profile option (might need to be set in RUSTFLAGS, search for it, sorry, I'm on my phone) that shows much more detailed information about building a single crate.

cargo timings
https://doc.rust-lang.org/nightly/cargo/reference/unstable.html#timings

https://github.com/dtolnay/cargo-llvm-lines/

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

## Update your dependencies

First, let’s do our homework.

I use cargo-outdated and cargo-tree and Cargo.lock file to find the outdated dependencies. I mostly care about the tree (or forest?) of dependencies my projects use. I also use cargo audit to get notified about any vulnerabilities which need to be addressed and cargo audit also shows information about deprecated crates which help with finding replacements.
So, my workflow is mostly:

1. Inside my project I run cargo update to update to latest semver compatible version.
2. Then I run cargo outdated -wR to find newer than semver compatible dependencies. Then update those and fix code as needed.
3. Then to find the dependencies with old dependencies themselves I can use cargo outdated or cargo tree or just look into Cargo.lock and find crates with multiple different versions and figure out where they come from (cargo tree helps with this).

When I have found something to work on from step 3., I fetch the repository and do what's described above in steps 1. and 2.
Also the step 3. of looking into Cargo.lock comes naturally to me when I update dependencies with cargo update and then review the changes to Cargo.lock before committing.

https://www.reddit.com/r/rust/comments/gi7v2v/is_it_wrong_of_me_to_think_that_rust_crates_have/fqe848y?utm_source=share&utm_medium=web2x

## Remove unused dependencies

Dependencies sometimes become unused because of refactoring or updating other dependencies.
From time to time it helps to check if all of them are still needed.

If this is your own project or a project you can contribute to, check if you can check with https://github.com/est31/cargo-udeps

If a dependency is still required, but quite heavy, it also helps to know _why_ it was pulled in. https://github.com/sfackler/cargo-tree can help here.
This also shows what of your dependencies are quite “heavy” and pull in many other crates that will slow down the build process so that you can look for lighter alternatives.

## Replace heavy dependencies

reqwests is quite heavy. Maybe try `[attohttpc](https://github.com/sbstp/attohttpc)`, which is more lightweight?

## Disable unused features of crate dependencies

Related to my previous point, check the feature flags of your dependencies. A lot of library maintainers take the effort to split their crate into separate features that can be toggled off on demand. Maybe you don’t need all the default functionality from every crate.

https://github.com/badboy/cargo-feature-set

For example, `serde` is quite modular.
If you don’t use the `Serialize` and `Deserialize` derives on your types, you can disable them with…
Similarly, `tokio` has a ton of features that you can disable if needed.

## Use Cargo Workspaces

Cargo has a feature called workspaces, which allows you to split one big crate into multiple smaller ones. This code-splitting is great for avoiding repetitive compilation, because only crates with code-changes have to be recompiled.
Bigger projects like \[Servo\](https://github.com/servo/servo/blob/master/Cargo.toml) and \[Vector\](https://github.com/timberio/vector/blob/1629f7f82e459ae87f699e931ca2b89b9080cfde/Cargo.toml#L28-L34) are using those to push down compile times.

https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html

## Use a Ramdisk for compilation

When starting to compile heavy projects, I noticed that I was throttled on I/O. The reason was that I kept my projects on an HDD. A more performant alternative would be to use an SSD, but even that is not ideal. SSDs usually have limited write-cycles.
Therefore I use a ramdisk for compiling Rust projects.

User `moschroe_de` had the following suggestion over on Reddit:

    mkdir target && \
    sudo mount -t tmpfs none ./target && \
    cat /proc/mounts | rg "$(pwd)" | sudo tee -a /etc/fstab

https://www.reddit.com/r/rust/comments/chqu4c/building_a_computer_for_fastest_possible_rust/ev02hqy?utm_source=share&utm_medium=web2x

## Cache dependencies with SCCache

## Cranelift - The alternative Rust compiler

https://jason-williams.co.uk/a-possible-new-backend-for-rust

![](https://lh4.googleusercontent.com/dGn56oGBSP2BTWq1qrP6GISfwZJOqXUC-KGKaSWQ1dw3smBoXY5klW6rXoWSJQrnOvc2bEX7E2muojG_3YRXlpwK-9lWsHuS1QL4kDyQnHF0mQhp6IYyfVaK9Kfz_zjm0lvX-UTB)

On vector:
Rustc 5m 45s
Cranelift 3m 13s

## Try a different Operating System

Linux vs macOS
E.g. lld is broken on macOS right now.

## Run compilation on a beefy machine

On portable devices, compiling can drain your battery.
To avoid that, I’m using my machine at home, a 6-core AMD FX 6300 with 12GB RAM as a build machine.
If you don’t have a dedicated machine yourself, you can use the cloud instead.
Gitpod.io is nice for testing a cloud build as they provide you a beefy machine for free for a limited period of time.

When it comes to buying hardware, here are some tips:

https://www.reddit.com/r/rust/comments/chqu4c/building_a_computer_for_fastest_possible_rust/

Generally you should get a proper multicore CPU like an AMD Ryzen Threadripper plus at least 32 GB of RAM

## Switch to lld as a linker

> The thing that nobody seems to target is linking time. For me when using something with a big dependency tree like Amethyst for example linking time on my fairly recent Ryzen 7 1700 is ~10s each time, even if I change only some minute detail only in my code.
> https://www.reddit.com/r/rust/comments/chqu4c/building_a_computer_for_fastest_possible_rust/euycz74?utm_source=share&utm_medium=web2x

lld is faster but not the default on many platforms

https://github.com/rust-lang/rust/issues/39915

[rust-lang/rust#39915](https://github.com/rust-lang/rust/issues/39915)

Here’s how to change that: https://stackoverflow.com/a/57817848/270334

## Avoid procedural macro crates

To speed up your builds, I suggest turning off debug info, using lld as a linker (if you're not in MacOS) and avoiding procedural macro crates.

Procedural macros are quite expensive to compile (monomorphization)

Example: serde
If you can’t avoid `Seriali`ze, you can try miniserde for faster compile times:

https://github.com/dtolnay/miniserde

https://www.reddit.com/r/rust/comments/dhroyo/announcing_watt_nearzerocompiletime_proc_macros/

Some more compile flags

https://doc.rust-lang.org/rustc/codegen-options/index.html

https://www.reddit.com/r/rust/comments/dbt0bv/cargo_build_time_on_no_changeswith_large/f297pgd/

## Drastic measures: Overclock your CPU?

⚠️ Warning: You can damage your hardware if you don’t know what you are doing. Proceed at your own risk.

This idea is for the desperate. I don’t even mean this half-seriously.
Now I don’t recommend that to everyone but if you have a standalone desktop computer with a decent CPU, this might be a way to squeeze out the last bits of performance gains.

Even though the Rust compiler is executing a lot of steps in parallel, single-threaded performance is still quite important.

https://www.youtube.com/watch?v=gb1QDpRnOvw&

[https://youtu.be/gb1QDpRnOvw](https://youtu.be/gb1QDpRnOvw)

## Conclusion

Once you’re done with optimizing your build times, how about optimizing runtime next?
My friend Pascal Hertleif has a nice article on that:
https://deterministic.space/high-performance-rust.html

Future work:

https://github.com/rust-lang/measureme/issues/51

[rust-lang/measureme#51](https://github.com/rust-lang/measureme/issues/51)

This is a living document and I’m planning to keep it up-to-date.
So by any means if you find something missing on this list, please create an issue here or edit the post directly. Thanks!
