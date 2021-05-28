+++
title="history (working title)"
date=2021-05-28
draft=true
[taxonomies]
tags=["dev", "rust"]
+++

While my partner is asleep, I have a good hour just for myself.
Let's have some fun and learn something new.
Perfect time to listen to some [Billie Joel](https://www.youtube.com/watch?v=cJtL8vWNZ4o) (it's either Billie Joel or Billie Eilish for me these days) and learn how the Unix "history" command works!
Life is good.

Learning how Unix commands work is a bit of a hobby of mine.
We talked about yes and cat before.
Don't judge.

## History time (see what I did there?)

How does `history` even work?

Every command is tracked in my history, so when I run `history` I see the last few commands on my machine.

```
 > history
 8680  cd endler.dev
 8682  cd content/2021
 8683  mkdir history
 8684  cd history
 8685  vim index.md
 8686  which history
 8687  man history
 8688  man 3 history
 8689  man 2 history
 8690  man 4 history
```

Yeah, but how does it _do_ that?

The manpage on my mac is not really helpful.

I found [this](https://medium.com/macoclock/forced-to-use-zsh-by-macos-catalina-lets-fix-our-history-command-first-9ce86dca540e) article (it's good etiquette nowadays to warn you that this is a Medium link) and it describes a bit what's going on.

Here's a sneak peek into my private `zsh` history:

```
~ ❯❯❯ tail $HISTFILE
: 1586007759:0;cargo clean
: 1586007763:0;gs
: 1586007771:0;git checkout -- Cargo.toml
: 1586007772:0;gs
: 1586007777:0;rm Cargo.lock
: 1586007788:0;cargo build
: 1586007797:0;cargo test
: 1586008203:0;git stats
: 1586008206:0;git status
: 1586008218:0;cargo publish
```

How exciting!

So let's see. We got a `: ` followed by a timestamp followed by `:0` then a separator (`;`) and then the command itself.
Each new command gets appended to the end.
Not too hard to recreate.

Hold on, what's the `:0` about!?
It's not always 0.

_DuckDuckGoing intensifies_

Aha! It's the command duration.

I found out by cheating a bit and looking at [other history tools](https://github.com/ellie/atuin/blob/802a2258cbd839c5b82d24f74d7aebe4a27d8dc5/atuin-client/src/import/zsh.rs#L171-L175).

My computer must be very fast.
(The real reason is probably that the command is wrapped by something else and thus takes zero time, but who am I to know)

Moving on.

## Hooking into history

But how does `history` _really_ work.

It must run some code whenever I execute a command
-- a hook of some sort.

Here's the answer:
https://github.com/ellie/atuin/blob/main/src/shell/atuin.zsh

I might not fully comprehend all of that is written here, but I'm a man of action and I can take a solid piece of work and strip it down to its bare minimum for my own enjoyment.

It's not much, but here's what I got:

```zsh
# Source this in your ~/.zshrc
autoload -U add-zsh-hook

_past_preexec(){
    echo "preexec"
}

_past_precmd(){
    echo "precmd"
}

add-zsh-hook preexec _past_preexec
add-zsh-hook precmd _past_precmd
```

(You can tell that I called my little `history` replacement "past". It's short and I like short names; it's also a bit snobby, but in a good way.)

Okay, let's tell ZSH to totally run this file whenever we run a command:

```
source src/shell/past.zsh
```

...aaaaaand

```zsh
> date
preexec
Fri May 28 18:53:55 CEST 2021
precmd
```

It works!
We're real programmers!

Actually I just now remember that I did [the same thing](https://github.com/mre/envy/blob/master/src/hooks/zsh.rs) for my little envirnment settings manager, [envy](https://github.com/mre/envy), over two years ago, [but hey](https://en.wiktionary.org/wiki/but_hey)!

So what do do with our newfound power?

Let's run some Rust code.

Here's the thing, though: Only `preexec` gets the "real" command. `precmd` gets nothing:

```zsh
_past_preexec(){
    echo "preexec $@"
}

_past_precmd(){
    echo "precmd $@"
}
```

`$@` means "show me what you got" and here's what it got:

```
date
preexec date date date
Fri May 28 19:02:11 CEST 2021
precmd
```

[Shouldn't one "date" be enough?](https://www.reddit.com/r/dating/comments/cbomd5/guy_asked_me_to_marry_him_after_first_date/)

Let's look at the `zsh` documentation for `preexec`:

> Executed just after a command has been read and is about to be executed. If the history mechanism is active (regardless of whether the line was discarded from the history buffer), the string that the user typed is passed as the first argument, otherwise it is an empty string. The actual command that will be executed (including expanded aliases) is passed in two different forms: the second argument is a single-line, size-limited version of the command (with things like function bodies elided); the third argument contains the full text that is being executed.

I don't know about you, but the last argument should be all we ever need. Why would anyone ever need a "truncated" version? 🤨

Checking...

```
ls -l
preexec ls -l lsd -l lsd -l
```

(Shout out to [lsd](https://github.com/Peltoche/lsd), the next gen ls command )

Alright then. Let's parse `$3` with some Rust code and write it to our own history file.

```rust
use std::env;
use std::error::Error;
use std::fs::OpenOptions;
use std::io::Write;

const HISTORY_FILE: &str = "lol";

fn main() -> Result<(), Box<dyn Error>> {
    let mut history = OpenOptions::new()
        .create(true)
        .append(true)
        .open(HISTORY_FILE)?;

    if let Some(command) = env::args().nth(3) {
        writeln!(history, "{}", command)?;
    };
    Ok(())
}
```

```zsh
> cargo run -- dummy dummy hello
> cargo run -- dummy dummy world
> cat lol
hello
world
```

We're almost done &mdash; at least if we're willing to cheat a bit. 😏
Let's hardcode that format string:

```rust
use std::env;
use std::error::Error;
use std::fs::OpenOptions;
use std::io::Write;
use std::time::SystemTime;

const HISTORY_FILE: &str = "lol";

fn timestamp() -> Result<u64, Box<dyn Error>> {
    let n = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH)?;
    Ok(n.as_secs())
}

fn main() -> Result<(), Box<dyn Error>> {
    let mut history = OpenOptions::new()
        .create(true)
        .append(true)
        .open(HISTORY_FILE)?;

    if let Some(command) = env::args().nth(3) {
        writeln!(history, ": {}:0;{}", timestamp()?, command)?;
    };
    Ok(())
}
```

Now it sorta writes our command in the standard zsh format.

(The part about the Unix timestamp was taken [straight from the docs](https://doc.rust-lang.org/std/time/struct.SystemTime.html). I regret nothing.)

Remember when I said that `precmd` gets nothing?
I lied.
In reality, you can read the exit code of the executed command (as `$?`). That's very helpful, but we just agree to ignore it and never talk about it again.

Our final `past.zsh` hooks file looks like that:

```zsh
autoload -U add-zsh-hook

_past_preexec(){
    past $@
}

add-zsh-hook preexec _past_preexec
```

Now here comes the 🚨 dangerous part 🚨!
I'm gonna replace the real history command with my own.
Never try this at home.
Actually I'm exaggerating a bit. Feel free to try it. Worst thing you'll learn something and lose a bit of history, but don't sue me.

First, let's change the path to the history file to my real one:

```
// You should read the ${HISTFILE} env var instead ;)
const HISTORY_FILE: &str = "/Users/mendler/.zhistory";
```

Then let's install `past`:

```
> cargo install --path .
# bleep bloop...
```

After that it's ready to use.

Just like every other artisanal, hot-chocolate drinking hipster I don't exactly run vanilla `zsh`; I run [prezto](https://github.com/sorin-ionescu/prezto). It's good.

To disable the original history module in prezto, I remove it from my `~/.zpreztorc`:

```
# Set the Prezto modules to load (browse modules).
# The order matters.
zstyle ':prezto:load' pmodule \
  'environment' \
  'terminal' \
  'editor' \
  'history' \ # removed this line
  'directory' \
  'spectrum' \
  'utility' \
  'completion' \
  'history-substring-search' \
  'prompt'
```

...and I add our hook to our custom history command to my `~/.zshrc`:

```
source "/Users/mendler/Code/private/past/src/shell/past.zsh"
```

And FINALLY we can test it.

We open a new shell and run a command followed by `history`:

```
> date
...
> ls
...
> it works
...
> history
```

```
 1011  date
 1012  ls
 1013  it works
```

It works!

Guess nobody is surpised by that.

## Lessons learned

- shells use hooks to write the commands into the history.
- The history file format is human-readable and pretty straightforward.
- I love Unix for it's hackability (is that a word?).
- Rewrite what you don't understand.
- The real `history` commands are extremely complicated and support [many commandline flags](https://ss64.com/bash/history.html). Fun fact: Did you know that in zsh, `history` is actually just an alias for `fc -l`? [More here](https://zsh.sourceforge.io/Doc/Release/Shell-Builtin-Commands.html)
