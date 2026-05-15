+++
title="How I Built My Own Newsletter Setup (And Why)"
date=2026-05-15
draft=true
[taxonomies]
tags=["dev", "culture"]
+++

A few people asked me how this newsletter is sent.
The honest answer is: I'm still figuring it out.

Here's the story so far, because the technical bits turned out to be less interesting than the path that got me there.

## Tinyletter

For years, my newsletter on this blog was just a small form pointing at Tinyletter.
I never thought about deliverability, bounce rates, suppression lists, SPF, DKIM, DMARC, or any of that.
I wrote a thing, hit send, people got it.
It just worked.

Then Tinyletter shut down.

I always wanted something *like* Tinyletter, but more open and more hackable.
Something I could actually understand.
With Tinyletter I had simplicity, but I didn't own anything.
When it disappeared, my list disappeared with it.

{{ figure(src="placeholder-tinyletter.jpg", caption="TODO: screenshot of the old Tinyletter signup form, or a goodbye-Tinyletter image") }}

## The fly.io Detour

People kept asking me when the newsletter was coming back, so I cobbled something together on fly.io.
A small Rust API, a CSV file with subscribers, sending through SMTP.
It worked, technically.
But I never actually sent anything.

I didn't really know what I wanted to write about, or who I was writing it *for*.
So the list just sat there.
Cold.
Months passed.
Then more months.

Turns out, a cold list is a problem all by itself.
When you finally do send to a list of people who haven't heard from you in a year, mail providers get suspicious and you can get flagged as spam.
Suddenly your "I'll get to it eventually" newsletter is actively bad for you.

I learned a lot in that period &ndash; the [git history](https://github.com/corrode/newsletter) is a graveyard of half-finished ideas &ndash; but the bigger lesson was about the writing, not the code:
I needed a clear idea of *who* this was for.

I love newsletters like [The Pragmatic Engineer](https://www.pragmaticengineer.com/) because they're hands-on and fact-heavy.
I wanted to do something in that spirit, but with more of *me* in it.
Random thoughts allowed.
Slightly weird tangents encouraged.
I'm a person, not a content pipeline.

(I've written about this before in [What to Write](/2024/what-to-write/).)

## The Hunt for a Sending Service

So now I had a goal, but I needed a service to actually send the mail.
This was the hardest part by far.

I tried a lot of things.
Mailchimp is bloated and feels designed for someone else.
Other services were either way too expensive for what I wanted to do, or pushed me toward "campaigns" with templates and tracking pixels and engagement scoring &ndash; which is the opposite of what I want.

I just want to send personal-feeling emails to people who said they wanted them.
No tracking.
Proper double opt-in.
Working unsubscribe headers.
That's it.

Then I found [Plunk](https://www.useplunk.com/).
Open source, fair pricing that scales with your list size, an API that doesn't fight me, and it does the deliverability work I don't want to think about &ndash; SES integration, bounce handling, suppression list, hosted unsubscribe pages.
I'm a paying customer now.
No affiliation, just genuinely happy.

I even sent them a small contribution at one point: [PR #359](https://github.com/useplunk/plunk/pull/359).
Merged in ten minutes.
That kind of responsiveness is rare, and it told me a lot about the project.

The first real send went out to a thousand-plus contacts that hadn't heard from me in ages.
I was bracing for a wave of bounces and a spam flag.
It went fine.
Bounce rate around 1%, no complaints.
I exhaled.

{{ figure(src="placeholder-status-dashboard.jpg", caption="TODO: screenshot of `send status` showing the colour-coded bounce table") }}

## The "This Feels Like Home" Moment

The setup clicked when I realized I could write issues as plain markdown files in a folder, version-controlled, with a small CLI for everything else.
That's where I feel at home.
Editor, terminal, git.
No web dashboard between me and the writing.

The whole thing lives in one repo:

```
newsletter/
├── issues/         # one .md per edition (1.md, 2.md, ...)
├── send/           # the CLI I run locally
├── subscribe/      # tiny HTTP service behind the website signup form
└── old/            # the previous fly.io setup, kept for reference
```

The CLI is called `send`. Here's what it can do:

```
$ send help

Usage: send <COMMAND>

Commands:
  new      Create a new issue file and open $EDITOR
  list     List local issues
  lint     Check links in an issue (or all issues)
  test     Send a test email to a single address
  publish  Publish the issue to all subscribed contacts
  status   Show contact-list and campaign deliverability report
  prune    List unsubscribed contacts and (after confirmation) delete them
```

Issues are plain markdown.
The first non-empty line is the topic.
Everything after is the body.
No frontmatter, no YAML, nothing to remember.

The subject line gets built automatically as `corrode v0.N.0 # <topic>`.
The major version stays at `0` forever &ndash; a small joke about projects that never quite reach 1.0.
(That subject scheme was Simon's idea. More on him in a second.)

`send publish 2` shows me a preview, the recipient count, and a `y/N` prompt before it actually fires anything off.
`send status` shows me per-campaign deliverability with bounce-rate cells colour-coded against the SES thresholds, plus daily bounces and unsubscribes, so I can spot trouble early.
`send prune` deletes unsubscribed contacts after I confirm, because Plunk keeps them around indefinitely otherwise.

The signup form on the website POSTs to a tiny Rust service called `subscribe`.
It validates the email, drops anything with the honeypot field filled in, and forwards to Plunk.
No JavaScript on the page.
Plunk sends a transactional confirmation email (double opt-in, basically free).

{{ figure(src="placeholder-architecture.jpg", caption="TODO: simple architecture diagram &mdash; website form → subscribe service → Plunk; send CLI → Plunk → SES → subscribers") }}

Everything runs on a Hetzner box.
I push to git, [Nixpacks](https://nixpacks.com/) detects the Rust crate, builds it, and the new version is live.
Push to deploy.
It feels almost unfair how easy this kind of thing has gotten.

Yes, I know I could have used an off-the-shelf tool.
But I've [argued before](/2025/build-it-yourself/) that building small things yourself is one of the best ways to actually understand them &ndash; and to keep owning the parts that matter.

## The Friend Who Told Me What Not To Do

A lot of what I avoided getting wrong, I avoided because of my friend [Simon](https://github.com/m3t0r) (yes, the same Simon who edits the [podcast](https://corrode.dev/podcast/)).
Simon knows mail.
More importantly, he knows *why* mail is hard, and he was generous with the warnings.
He told me what not to do and explained why.
He also came up with the `corrode v0.N.0` subject line, which still makes me smile every time I send an issue.

Thank you, Simon.

## The Bug I Shipped on Day One

I forgot that the `From:` address actually needs to be a real mailbox if you want replies to work.
The first issue went out as `newsletter@corrode.dev`, which didn't exist as a mailbox.
A kind reader replied to say hi, his message bounced, and he forwarded the bounce notice back to me to let me know.
Fixed within the hour.
Now the alias exists and replies just work.

You will ship bugs.
Ship them anyway.

## What I'd Tell You

If you've been thinking about doing this yourself: do it.
Self-hosting is genuinely easier than it used to be.
There are great open source services for almost every piece.
You don't need to reinvent the deliverability stack &ndash; you just need to pick the right tool (Plunk, in my case) and let it handle the parts you don't want to think about.

I have no idea what I'm doing most of the time.
I'm learning as I go.
It's fun, and that's most of why I'm doing it this way.

If you'd like a peek at the (somewhat hacky) repo, send me a mail and I'll send you a link.
Or wait until I clean it up a bit and open source it properly.
Probably both.

Reply anytime.
I read every email.
