+++
title="How Does The Unix `history` Command Work?"
date=2021-05-31
draft=false
[taxonomies]
tags=["dev", "rust"]
[extra]
credits = [
  {name = "Simon Brüggen", url="https://github.com/m3t0r" },
]
excerpt="""
In which we learn about the intricacies of the Unix `history` command, rewrite it
in Rust and throw it away again in the end as we uncover the truth.
"""
+++

{{ figure(src="hero.jpg", credits="Cozy attic created by [vectorpouch](https://www.freepik.com/vectors/poster) and tux created by [catalyststuff](https://www.freepik.com/vectors/baby) &mdash; freepik.com") }}

As the day is winding down, I have a good hour just to myself.
Perfect time to listen to some [Billie Joel](https://www.youtube.com/watch?v=cJtL8vWNZ4o) (it's either Billie Joel or Billie Eilish for me these days) and learn how the Unix `history` command works.
Life is good.

Learning what makes Unix tick is a bit of a hobby of mine.  
I covered [yes](/2017/yes/), [ls](/2018/ls/), and [cat](/2018/fastcat/) before.
Don't judge.

## How does history even work?

Every command is tracked, so I see the last few commands on my machine when I run `history`.

```sh
❯❯❯ history
8680  cd endler.dev
8682  cd content/2021
8683  mkdir history
8684  cd history
8685  vim index.md
```

## Yeah, but how does it _do_ that?

The manpage on my mac is not really helpful &mdash; I also couldn't find much in the first place.

I found [this](https://medium.com/macoclock/forced-to-use-zsh-by-macos-catalina-lets-fix-our-history-command-first-9ce86dca540e) article (it's good etiquette nowadays to warn you that this is a Medium link) and it describes a bit of what's going on.

Every command is stored in `$HISTFILE`, which points to `~/.zsh_history` for me.

```sh
❯❯❯ tail $HISTFILE
: 1586007759:0;cd endler.dev
: 1586007763:0;cd content/2021
: 1586007771:0;mkdir history
: 1586007772:0;cd history
: 1586007777:0;vim index.md
...
```

So let's see. We got a `:` followed by a timestamp followed by `:0`, then a
separator (`;`) and finally the command itself. Each new command gets appended
to the end of the file. Not too hard to recreate.

Hold on, what's that 0 about!?

It turns out it's the **command duration**, and the entire thing is called the [extended history format](https://zsh.sourceforge.io/Doc/Release/Options.html#History):

```sh
: <beginning time>:<elapsed seconds>;<command>
```

(Depending on your settings, your file might look different.)

## Hooking into history

But still, how does `history` _really_ work.

It must run some code whenever I execute a command
&mdash; **a hook of some sort**!

{% info() %}
💥 **Swoooooosh** 💥

Matthias from the future steps out of a blinding ball of light: _Waaait!
That's not really how it works!_

It turns out that shells like bash and zsh don't _actually_ call a hook for `history`.
Why should they? When `history` is a shell builtin, they can just track the commands
_internally_.

Thankfully my editor-in-chief and resident Unix neckbeard [Simon Br&uuml;ggen](https://github.com/m3t0r)
explained that to me &mdash; but only _after_ I sent him the first draft for this article. 😓

As such, the next section is a bit like _Lord of the Rings_: a sympathetic
but naive fellow on a questionable mission with no clue of what he's getting
himself into.

In my defense, Lord of the Rings is also enjoyed primarily for its entertainment
value, not its _historical_ accuracy.... and just like in this epic story, I
promise we'll get to the bottom of things in the end.
{% end %}

I found [add-zsh-hook](https://zsh.sourceforge.io/Doc/Release/User-Contributions.html)
and a usage example in [atuin's source code](https://github.com/ellie/atuin/blob/main/atuin/src/shell/atuin.zsh).

I might not fully comprehend all of that is written there, but I'm a man of action, and I can take a solid piece of work and tear it apart.

It's not much, but here's what I got:

```sh
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

This sets up two hooks: the first one gets called right before a command gets
executed and the second one directly after. (I decided to call my little
`history` replacement _past_. I like short names.)

Okay, let's tell zsh to totally run this file whenever we execute a command:

```sh
source src/shell/past.zsh
```

...aaaaaand

```sh
❯❯❯ date
preexec
Fri May 28 18:53:55 CEST 2021
precmd
```

It works! ✨ **How exciting!** ✨

Actually, I just remember now that [I did the same thing](https://github.com/mre/envy/blob/master/src/hooks/zsh.rs) for my little environment settings manager [envy](https://github.com/mre/envy) over two years ago, [but hey](https://en.wiktionary.org/wiki/but_hey)!

So what to do with our newly acquired power?

## Let's Run Some Rust Code

Here's the thing: only `preexec` gets the "real" command. `precmd` gets nothing:

```sh
_past_preexec(){
    echo "preexec $@"
}

_past_precmd(){
    echo "precmd $@"
}
```

`$@` means "show me what you got" and here's what it got:

```sh
❯❯❯ date
preexec date date date
Fri May 28 19:02:11 CEST 2021
precmd
```

[Shouldn't one "date" be enough?](https://www.reddit.com/r/dating/comments/cbomd5/guy_asked_me_to_marry_him_after_first_date/)  
Hum... let's look at the [zsh documentation for `preexec`](https://zsh.sourceforge.io/Doc/Release/Functions.html):

> If the history mechanism is active [...], the string that the user typed is passed as the first argument, otherwise it is an empty string. The actual command that will be executed (including expanded aliases) is passed in two different forms: the second argument is a single-line, size-limited version of the command (with things like function bodies elided); the third argument contains the full text that is being executed.

I don't know about you, but the third argument should be all we ever need? 🤨

Checking...

```sh
❯❯❯ ls -l
preexec ls -l lsd -l lsd -l
```

(Shout out to [lsd](https://github.com/Peltoche/lsd), the next-gen ls command )

Alright, good enough. Let's parse `$3` with some Rust code and write it to our own history file.

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

```sh
❯❯❯ cargo run -- dummy dummy hello
❯❯❯ cargo run -- dummy dummy world
❯❯❯ cat lol
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

Now, if we squint a little, it sorta kinda writes our command in my history format.
(That part about the Unix timestamp was taken [straight from the docs](https://doc.rust-lang.org/std/time/struct.SystemTime.html). Zero regrets.)

Remember when I said that `precmd` gets nothing?

I lied.

In reality, you can read the exit code of the executed command (from `$?`). That's very helpful, but we just agree to ignore that and never talk about it again.

With this out of the way, our final `past.zsh` hooks file looks like that:

```sh
autoload -U add-zsh-hook

_past_preexec(){
    past $@
}

add-zsh-hook preexec _past_preexec
```

Now here comes the dangerous part!
Step back while I replace the original `history` command with my own.
Never try this at home.
(Actually I'm exaggerating a bit. Feel free to try it. Worst thing that will happen is that you'll lose a bit of history, but don't sue me.)

First, let's change the path to the history file to my real one:

```rust
// You should read the ${HISTFILE} env var instead ;)
const HISTORY_FILE: &str = "/Users/mendler/.zhistory";
```

Then let's install `past`:

```sh
❯❯❯ cargo install --path .
# bleep bloop...
```

After that, it's ready to use.
Let's add that bad boy to my `~/.zshrc`:

```sh
source "/Users/mendler/Code/private/past/src/shell/past.zsh"
```

And FINALLY we can test it.

We open a new shell and run a few commands followed by `history`:

```sh
❯❯❯  date
...
❯❯❯ ls
...
❯❯❯ it works
...
❯❯❯ history
 1011  date
 1012  ls
 1013  it works
```

✨ **Yay.** ✨ [The source code for `past` is on Github.](https://github.com/mre/past)

## How it _really_ _really_ works

Our experiment was a great success, but I since learned that reality is a bit different.

["In early versions
of Unix the history command was a separate program"](<https://en.wikipedia.org/wiki/History_(command)#History>), but most modern shells have `history` builtin.

zsh tracks the history in its main [run loop](https://github.com/zsh-users/zsh/blob/00d20ed15e18f5af682f0daec140d6b8383c479a/Src/init.c#L120).
Here are the important bits. (Assume all types are in scope.)

```c
Eprog prog;

/* Main zsh run loop */
for (;;)
{
    /* Init history */
    hbegin(1);
    if (!(prog = parse_event(ENDINPUT)))
    {
        /* Couldn't parse command. Stop history */
        hend(NULL);
        continue;
    }
    /* Store command in history */
    if (hend(prog))
    {
        LinkList args;
        args = newlinklist();
        addlinknode(args, hist_ring->node.nam);
        addlinknode(args, dupstring(getjobtext(prog, NULL)));
        addlinknode(args, cmdstr = getpermtext(prog, NULL, 0));

        /* Here's the preexec hook that we used.
        * It gets passed all the args we saw earlier.
        */
        callhookfunc("preexec", args, 1, NULL);

        /* Main routine for executing a command */
        execode(prog);
    }
}
```

The history lines are kept in a hash, and also in a [ring-buffer](https://en.wikipedia.org/wiki/Circular_buffer)
to prevent the history from getting too big. ([See here](https://github.com/zsh-users/zsh/blob/00d20ed15e18f5af682f0daec140d6b8383c479a/Src/hist.c#L98-L103).)

That's smart! Without the ring-buffer, a malicious user could just thrash the history with random commands
until a buffer overflow is triggered. I never thought of that.

## History time (see what I did there?)

The original `history` command was added to the Unix C shell (csh) in 1978.
Here's a link to [the paper](https://web.archive.org/web/20220605000427/http://www.kitebird.com/csh-tcsh-book/csh-intro.pdf) by [Bill Joy](https://en.wikipedia.org/wiki/Bill_Joy) (hey, another Bill!).
He took inspiration from the `REDO` command in Interlisp.
You can find its specification in the original Interlisp manual in [section 8.7](https://larrymasinter.net/86-interlisp-manual-opt.pdf).

## Lessons learned

- Rebuild what you don't understand.
- The history file is human-readable and pretty straightforward.
- The `history` command is a shell builtin, but we can use hooks to write our own.
- Fun fact: Did you know that in zsh, `history` is actually just an alias for `fc -l`? [More info here](https://zsh.sourceforge.io/Doc/Release/Shell-Builtin-Commands.html) or [check out the source code](https://github.com/zsh-users/zsh/blob/00d20ed15e18f5af682f0daec140d6b8383c479a/Src/builtin.c#L86).

“What I cannot create, I do not understand” &mdash; Richard Feynman
