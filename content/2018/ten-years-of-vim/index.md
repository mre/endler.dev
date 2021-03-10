+++
title="Ten Years of Vim"
date=2018-05-20
aliases = ["2018/ten-years-of-vim", "2018/ten-years-of-Vim" ]

[extra]
css=true
excerpt="When I opened Vim by accident for the first time, I thought it was broken. My keystrokes changed the screen in unpredictable ways, and I wanted to undo things and quit. Needless to say, it was an unpleasant experience. There was something about it though, that kept me coming back and it became my main editor. Fast forward ten years (!) and I still use Vim. Why is that?"
social_img="2018-ten-years-of-vim.png"
comments = [
  {name = "Hacker News", url = "https://news.ycombinator.com/item?id=17115008"},
  {name = "Twitter", url = "https://twitter.com/matthiasendler/status/998145882179751936"},
  {name = "Lobsters", url = "https://lobste.rs/s/xoploc/ten_years_vim"},
  {name = "/r/programming on Reddit", url = "https://www.reddit.com/r/programming/comments/8ksxqn/ten_years_of_vim/"},
  {name = "/r/vim on Reddit", url = "https://www.reddit.com/r/vim/comments/8ksxgz/ten_years_of_vim/"},
]
+++

<div class="vim">
<div class="cursor"></div>
</div>

When I opened Vim by accident for the first time, I thought it was broken. My
keystrokes changed the screen in unpredictable ways, and I wanted to undo things
and quit. Needless to say, it was an unpleasant experience. There was something
about it though, that kept me coming back and it became my main editor.

Fast forward ten years (!) and I still use Vim.
After all the Textmates and Atoms and PhpStorms I tried, I still find myself at home in Vim.
People keep asking me: Why is that?

## Why Vim?

Before Vim, I had used many other editors like notepad or nano. They all behaved more or less as expected: you insert text, you move your cursor with the arrow keys or your mouse, and you save with `Control + S` or by using the menu bar. VI (and Vim, its spiritual successor) is different.

EVERYTHING in Vim is different, and that's why it's so highly effective. Let me explain.

## The Zen of Vim

The philosophy behind Vim takes a while to sink in:
While other editors focus on _writing_ as the central part of working with text, Vim thinks it's _editing_.

You see, most of the time I don't spend writing _new_ text; instead, I edit _existing_ text.  
I mold text, form it, turn it upside down.
Writing text is craftsmanship and hard work. You have to shape your thoughts with your cold, bare hands until they somewhat form a coherent whole.
This painful process is what Vim tries to make at least bearable. It helps you keep control.
It does that, by providing you sharp, effective tools to modify text.
The core of Vim is a language for editing text.

## Vim, the language

The Vim commands are not cryptic, you already know them.

- To <u>u</u>ndo, type `u`.
- To <u>f</u>ind the next <u>t</u>, type `ft`.
- To <u>d</u>elete <u>a</u> <u>w</u>ord, type `daw`.
- To <u>c</u>hange <u>a</u> <u>s</u>entence, type `cas`.

More often than not, you can _guess_ the correct command by thinking of an operation you want to execute and an object to execute it on.
Then just take the first character of every word. Try it!
If anything goes wrong, you can always hit `ESC` and type `u` for undo.

**Operations**: delete, find, change, back, insert, append,...  
**Objects**: word, sentence, parentheses, (html) tag,... (see `:help text-objects`)

Inserting text is just another editing operation, which can be triggered with `i`.
That's why, by default, you are in [normal mode](https://en.wikibooks.org/wiki/Learning_the_vi_Editor/Vim/Modes) &mdash; also called command mode &mdash; where all those operations work.

Once you know this, Vim makes a lot more sense, and that's when you start to be productive.

## How my workflow changed over the years

When I was a beginner, I was very interested in how people with more Vim experience would use the editor.
Now that I'm a long-time user, here's my answer: there's no secret sauce.
I certainly feel less exhausted after editing text for a day, but 90% of the commands I use fit on a post-it note.

That said, throughout the years, my Vim habits changed.  
I went through several phases:

Year 1: I'm happy if I can insert text and quit again.  
Year 2: That's cool, let's learn more shortcuts.  
Year 3-5: Let's add _all_ the features!!!  
Year 6-10: My `.vimrc` is five lines long.

Year three is when I started to learn the Vim ecosystem for real.
I tried all sorts of flavors like [MacVim](https://macvim-dev.github.io/macvim/) and distributions like [janus](https://github.com/carlhuda/janus).
For a while, I even maintained [my own Vim configuration
](https://github.com/mre/dotVim/blob/master/.vimrc), which was almost 400 lines long.

All of that certainly helped me learn what's out there, but I'm not sure if I would recommend that to a Vim beginner.
After all, you don't really _need_ all of that. Start with a vanilla Vim editor which works just fine!

My current Vim setup is pretty minimalistic. I don't use plugins anymore, mostly out of laziness and because built-in Vim commands or macros can replace them.

Here are three concrete examples of how my workflow changed over the years:

1. In the beginning, I used a lot of "number powered movements". That is, if you have a command like `b`, which goes back one word in the text, you can also say `5b` to go back five words. Nowadays I mostly use `/` to move to a matching word because it's quicker.

2. I don't use arrow keys to move around in text anymore but forced myself to use `h`, `j`, `k`, `l`. Many people say that this is faster. After trying this for a few years, I don't think that is true (at least for me). I now just stick to it out of habit.

3. On my main working machine I use Vim for quick text editing and Visual Studio Code plus the awesome [Vim plugin](https://github.com/VSCodeVim/Vim) for projects. This way, I get the best of both worlds.

## Workflow issues I still struggle with

After all these years I'm still not a Vim master &mdash; far from it.
As every other Vim user will tell you, we're all still learning.

Here are a few things I wish I could do better:

- **Jumping around in longer texts**: I know the basics, like searching (`/`), jumping to a matching bracket (`%`) or jumping to specific lines (for line 10, type `10G`), but I still could use [symbols](<https://en.wikipedia.org/wiki/Symbol_(programming)>) more often for navigation.
- **Using visual mode for moving text around**: Sometimes it can be quite complicated to type the right combination of letters to cut (delete) the text I want to move around. That's where visual mode (`v`) shines. It highlights the selected text. I should use it more often.
- **Multiple registers for copy and paste**: Right now I only use one register (like a pastebin) for copying text, but Vim supports multiple registers. That's cool if you want to move around more than one thing at the same time. [Let's use more of those!](https://vim.fandom.com/wiki/Copy%2c_cut_and_paste)
- **Tabs**: I know [how tabs work](https://vim.fandom.com/wiki/Using_tab_pages), but all the typing feels clunky. That's why I never extensively used them. Instead, I mostly use multiple terminal tabs or an IDE with Vim bindings for bigger projects.

## Would I learn Vim again?

That's a tough question to answer.

On one side, I would say no.
There's a steep learning curve in Vim and seeing all those modern IDEs become better at understanding the user's intent, editing text became way easier and faster in general.

On the other side, Vim is the fastest way for me to write down my thoughts and code. As a bonus, it runs on every machine and might well be around in decades to come. In contrast, I don't know if the IntelliJ shortcuts will be relevant in ten years (note: if you read this in the future and ask yourself "What is IntelliJ?", the answer might be no).

## Takeaways

If I can give you one tip, don't learn Vim by memorizing commands. Instead, look at your current workflow and try to make it better, then see how Vim can make that easier. It helps to look at [other people using Vim to get inspired](https://youtu.be/yG-UaBJXZ80?t=43m12s) (Youtube link with sound).

You will spend a lot of time writing text, so it's well worth the time investment to learn one editor really well &mdash; especially if you are a programmer.

After ten years, Vim is somehow ingrained in my mind. I _think_ Vim when I'm editing text. It has become yet another natural language to me. I'm looking forward to the next ten years.
