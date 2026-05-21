+++
title="How I Built My Own Newsletter Setup (And Why)"
date=2026-05-15
draft=false
[taxonomies]
tags=["dev", "culture"]
+++

I had a newsletter on this blog for years, but I didn't send a single email for a long time.
This is the story of how I finally got it back up and running, and what I learned along the way.

{{ figure(src="tinyletter-landing-page.jpg", caption="The old Tinyletter landing page, now a sad 404.", credits="[Wayback Machine](https://web.archive.org/web/20240229161126/http://tinyletter.com/)") }}


## The Tinyletter Years

For years my setup was a small form on the website pointing at Tinyletter, a small newsletter service that was focused on writers.
What I liked about it was the simplicity.
I never had to think about email deliverability, bounce rates, suppression lists, SPF, DKIM, DMARC, or any of that.
I wrote a thing, hit send, people got it.

{{ figure(src="tinyletter-compose-message.jpg", caption="The Tinyletter compose page, showing the simplicity of the interface.") }}

It just worked. Then Tinyletter shut down.

A bit of history: Tinyletter was built in 2010 by [Philip Kaplan](https://en.wikipedia.org/wiki/Philip_Kaplan), reportedly coded [in a single day (on Sunday, the 31st of October, 2010)](https://techcrunch.com/2010/11/12/pud-revisits-his-past-launches-an-email-newsletter-platform-with-tinyletter/).

It got acquired by Mailchimp one year later, and quietly became the de facto home for writers who wanted a personal newsletter without thinking about funnels, segments, or A/B tests.

Then in late 2023, Mailchimp (now part of Intuit) announced they'd shut it down.
The official wording was that their "business priorities have evolved" and that they were "laser focused on building tools to serve marketers and help small businesses grow."
[But perhaps writers were never the customer.](https://simonowens.substack.com/p/tinyletter-was-one-of-the-greatest)

{{ figure(src="tinyletter-shutdown.png", caption="Mailchimp's shutdown announcement, late 2023.", credits="[EmailOctopus](https://emailoctopus.com/blog/alternative-to-tinyletter)") }}

Just before Tinyletter went dark on February 29, 2024, I made a final backup of my subscriber list, but I didn't have a plan for what to do with it.

## Denial 

At this point, I became hostile to the idea of using a third-party service.
I looked at all options and bounced off all of them.

- **Too expensive.** Most services price per contact and assume you're running a business funnel, not writing letters to people.
- **Too marketing-focused.** Templates, drag-and-drop builders, A/B tests, engagement scoring, tracking pixels. The whole vocabulary is wrong. I don't want to run *campaigns*; I want to send *email*!
- **Not hacker-friendly.** No markdown, no CLI, no API I'd actually enjoy using. Everything happens in a web dashboard built for a marketing team.
- **Not open source.** If the next Tinyletter shuts down, I'd like to keep going without having to migrate again.
- **Tracking by default.** Open tracking, click tracking, pixels in every footer. I don't want to know who opened what. I want to write, you read it (or don't), the end.

## Migrating to Fly.io 

People kept asking me when the newsletter was coming back, so I cobbled something together on fly.io.
A small Rust API, a CSV file with subscribers, and a way to subscribe through the website. 
The idea was to deal with the sending later, but at least offer a way to sign up.

The list just sat there. Cold.

Turns out, a cold list is a problem all by itself.
When you finally do send to a list of people who haven't heard from you in a long time, mail providers get suspicious and you can get flagged as spam.
Suddenly your own newsletter can turn against you. 

I learned a lot in that period, but the bigger lesson was about the writing, not the code:
I needed a clear idea of *who* this was for.

I love newsletters like [The Pragmatic Engineer](https://www.pragmaticengineer.com/) because they're hands-on and fact-heavy.
I wanted to do something in that spirit, but with more of *me* in it.
I'm a person, not a content pipeline.

(I've written about this before in [What to Write](/2024/what-to-write/).)

## The Hunt for a Sending Service

Eventually, I went back to the original problem: I still needed something to actually send the mail.
This was the hardest part by far.

Then I found [Plunk](https://www.useplunk.com/).
It is open source, the pricing scales with your list size, and the API doesn't fight me.
It does the deliverability work I don't want to think about ([SES integration](https://aws.amazon.com/ses/), [bounce handling](https://debounce.com/glossary/bounce-handling/), [suppression list](https://mailchimp.com/resources/email-suppression-list/), [hosted unsubscribe pages](https://docs.useplunk.com/concepts/templates)).
I'm a paying customer now.
I'm not affiliated, just a genuinely happy user. 

I even sent them a [small contribution](https://github.com/useplunk/plunk/pull/359) and they merged it in ten minutes.
This made me feel like I was actually part of the community.

The first real send went out to a thousand-plus contacts that hadn't heard from me in ages.
I was bracing for a wave of bounces and a spam flag.
It went fine.
Bounce rate around 1%, no complaints.
I exhaled.

{{ figure(src="plunk-dashboard.jpg", caption="The Plunk dashboard, showing the campaign overview and deliverability report. As you can see, I don't track who opens my emails.", credits="[Plunk](https://www.useplunk.com/)") }}

## This Feels Like Home

I realized I could write issues as plain markdown files in a folder, version-controlled, with a small CLI for everything else.
That's where I feel at home.
Just me, a cup of hot chocolate, my editor, the terminal, and git.
No more web dashboard between me and the writing.

The whole thing lives in a single repo:

```
newsletter/
├── issues/         # one .md per edition (1.md, 2.md, ...)
├── send/           # the CLI I run locally
└── subscribe/      # tiny HTTP service behind the website signup form
```

The CLI is called `send`. Here's what it can do:

```
$ send help

Usage: send <COMMAND>

Commands:
  new      Create a new issue file and open $EDITOR
  list     List local issues
  lint     Check links in an issue (or all issues)
  test     Send a test email to myself 
  publish  Publish the issue to all subscribed contacts
  status   Show contact-list and deliverability report
  prune    Delete unsubscribed contacts
```

`send publish 2` shows me a preview, the recipient count, and a `y/N` prompt before it actually fires anything off.
`send status` shows me per-campaign deliverability with bounce-rate cells colour-coded against the SES thresholds, plus daily bounces and unsubscribes, so I can spot trouble early.

The signup form on the website POSTs to a tiny Rust service called `subscribe`, which runs on my own server.
It validates the email, and forwards to Plunk. No JavaScript needed. 
Plunk sends a transactional confirmation email (for double opt-in).

Everything runs on a Hetzner box which runs Coolify.
I push to git, [Nixpacks](https://nixpacks.com/) detects the Rust crate, builds it, and the new version is live.

[Building small things yourself](/2025/build-it-yourself/) is one of the best ways to actually understand them and to keep owning the parts that matter.

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
I fixed it and now the alias exists and replies just work.

## One List, Not Two

While I was at it, I also collapsed my older endler.dev newsletter and the corrode.dev one into a single list.
Both were always written by me, and running two parallel setups never really made sense &ndash; same person on the keyboard, mostly overlapping audience, twice the maintenance. Going forward, there's just one newsletter. If any of this isn't for you, you can always unsubscribe and never hear from me again. No hard feelings. 

## What I'd Tell You

If you've been thinking about doing this yourself: do it.
Self-hosting is genuinely easier than it used to be.
There are great open source services for almost every piece.
That would be its own blog post, so let me know if you want me to write it.

If you'd like a peek at the (somewhat hacky) repo, send me a mail and I'll send you a link.
It's really not that interesting, but if you're curious about how it works, I'm happy to share.
Or wait until I clean it up a bit and open source it properly.
Probably will just take me another few years to get around to it. 
