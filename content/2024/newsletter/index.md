+++
title="Running my own newsletter"
date=2024-02-21
draft=false
[taxonomies]
tags=["dev", "rust"]
[extra]
+++

For many yeas I've used TinyLetter to send out my newsletter.
They recently announced that they will shut down their service,
so I went looking for an alternative.

## The wishlist

- Plain text emails
- No tracking
- Privacy-friendly
- Free or cheap
- No banner ads on my website

One might think that it should be easy to find such a service, but tough luck!

What I found was a mix of "all-in-one" solutions, half-baked newsletter
services, and outdated or overly complicated self-hosted solutions.

## The "All-in-one" solutions

These are services that offer everything from landing pages to email
marketing. I don't use 90% of their features, and they
often use tracking and other privacy-invasive techniques.
Examples include Mailchimp, ConvertKit, and Ghost.

## The "Just A Newsletter" solutions

These are services that focus on newsletters, 
but they still look like platforms that aim to collect VC money.
They justify their existence by offering fancy templates and
transactional emails and 

Examples are Substack and Curated.

## The "Self-hosted" solutions

These are services that you can host yourself.
They are often outdated, hard to set up, and require
maintenance. Examples include Mailtrain and Sendy.

## Declaring Newsletter Bankruptcy

With just a few days left until TinyLetter shuts down, I decided to
declare newsletter bankruptcy. I exported my list of subscribers and
started thinking about a custom solution.

Here's the stack I came up with:

- A CSV file with subscribers
- CLI tool to send out emails
- A simple way to subscribe and unsubscribe through a Cloudflare Worker

## What I did

### Subdomain for the newsletter

A friend of mine suggested that I send out my newsletter from a
subdomain of my website. This way, I can separate the newsletter
reputation from my main domain.

I created a new subdomain, `mailer.corrode.dev`, and
set up DKIM and SPF records for it.
After some waiting time, I could create the alias in my email
server and start sending out emails.


Subdomain Use for Email Campaigns

    Isolation: Using a subdomain like mailer.corrode.dev for sending newsletters or marketing emails can help isolate the email reputation of your main domain corrode.dev. This is because many email service providers and reputation systems treat subdomains as separate entities for reputation purposes.

    Reputation Impact: If something goes wrong with your newsletter campaign (e.g., high bounce rates, spam complaints), it's the reputation of the subdomain that's primarily affected. However, it's essential to note that some email service providers might still consider the reputation of the parent domain in their filtering decisions, especially if they detect patterns of abuse across multiple subdomains.

    Best Practices: Regardless of whether you use a main domain or a subdomain, adhering to email best practices is crucial. This includes obtaining explicit consent from recipients, providing a clear unsubscribe option, and maintaining good list hygiene to minimize bounces and complaints.

Email warmup:

| Day  | Recipients      | Notes                                                   |
|------|-----------------|---------------------------------------------------------|
| 1    | 5 (Test Emails) | Send test emails to friends or colleagues to check deliverability and gather initial feedback. |
| 2    | 30              | Start with 10% of your list, choosing recipients randomly or by segment if possible. |
| 3    | Rest/Review     | Analyze feedback from test sends. Adjust if necessary.  |
| 4    | 60              | Increase to 20% of your list, focusing on new recipients. |
| 5    | Rest/Review     | Check for deliverability issues or complaints.          |
| 6    | 90              | Send to 30% of your list, avoiding any previous recipients. |
| 7    | Rest/Review     | Analyze engagement: opens, clicks, and any direct responses. |
| 8    | 115             | Target the remaining 40% of your list.                  |
| 9+   | Review          | Evaluate overall performance, adjust future sends based on feedback. |




### Testing email sending

I warmed up the domain by sending out a few emails to myself and
a few friends. I checked the reputation of my domain on
https://www.mail-tester.com and made sure that my emails
didn't end up in the spam folder.

### Cloudflare Worker for subscribing and unsubscribing

I created a simple Cloudflare Worker that accepts POST requests
to `/subscribe` and `/unsubscribe`. The worker checks the
request body for a valid email address and adds or removes it
from the CSV file.

It's written in Rust and uses the `csv` crate to read and write
the CSV file.

```rust
use csv::ReaderBuilder;
use csv::WriterBuilder;
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;

#[derive(Debug)]
struct Subscriber {
    email: String,
}

fn main() {
    let mut body = String::new();
    let _ = std::io::stdin().read_to_string(&mut body);

    let mut rdr = ReaderBuilder::new()
        .has_headers(false)
        .from_reader(File::open("subscribers.csv").unwrap());

    let mut subscribers: Vec<Subscriber> = rdr
        .deserialize()
        .map(|result| result.unwrap())
        .collect();

    let mut writer = WriterBuilder::new()
        .has_headers(false)
        .from_writer(File::create("subscribers.csv").unwrap());

    let email = body.trim();
    let subscriber = Subscriber {
        email: email.to_string(),
    };

    if body.starts_with("subscribe") {
        subscribers.push(subscriber);
    } else if body.starts_with("unsubscribe") {
        subscribers.retain(|s| s.email != email);
    }

    for subscriber in subscribers {
        writer.serialize(subscriber).unwrap();
    }
}
```


## Add the following information to your emails

- Use https://www.mail-tester.com to check your email reputation
- Physical address
- List-Unsubscribe header
- Warm up your domain: Start with a small number of emails and gradually increase the volume
  in order to build a good reputation with the email providers.
- Learn about hard [email bounces](https://postmarkapp.com/guides/email-bounces) and handle them quickly.


