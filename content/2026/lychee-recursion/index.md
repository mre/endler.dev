+++
title="Five Years of Trying to Add Recursion to lychee"
date=2026-05-31
draft=false
[taxonomies]
tags=["rust", "dev", "lychee", "async"]
+++

Recursion has been [lychee](https://github.com/lycheeverse/lychee)'s longest-standing open issue. It's been sitting there, unresolved, for over five years now.

If you haven't come across it before, lychee is a fast, async link checker written in Rust (BTW).
I started it in 2020 because I got bored at home. By now, around 40k GitHub repositories depend on it.
You point it at your website, your docs, your README, your Markdown files.
Google, AWS, Microsoft, Cloudflare, and many others use it to check links in their documentation.

I gave [talks](https://www.youtube.com/watch?v=BIguvia6AvM) and [podcasts](https://www.youtube.com/watch?v=plEz4l7HwhY) about it, in case you'd like to learn more.

{{ figure(src="screencast.svg", caption="lychee goes weeeee...") }}


lychee got [funded by NLnet](https://nlnet.nl/) through their [NGI Zero program](https://nlnet.nl/NGI0/) for open, trustworthy infrastructure.

That funding allowed us to spend serious, focused time on the project instead of coding late at night.[^night]
The funding is now coming to an end, which feels like the right moment to write this post.

[^night]: Well, to be fair, I still code late at night. But that's just how I'm wired.

And the most honest thing I can say is this: the single most requested feature, recursion, still isn't shipped. :,(
But there are good reasons! Of course, the gist is "it's hard," but let's go deeper than that.

## Where It Started

On December 14, 2020, a user named [**@styfle**](https://github.com/styfle) opened [issue #78](https://github.com/lycheeverse/lychee/issues/78):

{{ figure(src="issue78.jpg", caption="The original recursion issue") }}

Very reasonable! At that point, lychee was already a fast, concurrent link checker with a lot of features. Surely adding a little `--recursive` flag to follow links within a domain could be done in an honest day's work, no? 

But five years, four serious implementation attempts, and several abandoned pull requests later, recursion still isn't merged. The issue is tagged for the v1.0 milestone and we still want to ship it before that. But somewhere along the way it became lychee's white whale.

## My Initial Architecture Made It Hard

To understand why recursion is so difficult to add, you need to understand how lychee processes things.
Here's the flow from back in late 2020:

{{ figure(src="initial-architecture.svg", caption="lychee's initial architecture") }}

Basically one big pipeline, from input URLs over link extraction, to link checking, to output formatting.

When @styfle opened the issue, I [spotted the core problem almost immediately](https://github.com/lycheeverse/lychee/issues/78#issuecomment-744720356):

> There is no connection back to the extractor.

That missing feedback loop (from checked responses back to the input queue) is the whole problem in a nutshell. lychee's pipeline was designed as a one-shot, unidirectional flow: inputs go in one end, results come out the other, and the program stops when the input stream stops.
Recursion needs a *cycle*: responses have to be able to create new inputs. And cycles in async, channel-based pipelines are where the dragons live. 🐲

I knew this on day one. I just badly underestimated how many ways we'd find to get the cycle wrong.

## Attempt 1: A Simple Counter (February - December 2021)

My [first attempt](https://github.com/lycheeverse/lychee/pull/165) was deliberately small. I didn't want to rearchitect anything; I just wanted recursion to work!
So I added the handling directly in `main.rs`. The idea was:

1. After receiving a response, extract links from it if it came from one of the original input domains.
2. Push those new links back into the request channel.
3. Keep a running count of total expected requests vs. completed requests.
4. Stop when `completed == total`.

I added a `recurse()` function that called `collector::collect_links()` on successful responses, spawned a task to send the new requests into the channel, and returned how many new requests it created. A plain `HashSet<String>` acted as a "seen" cache so I wouldn't re-check the same URL twice.

On top of that:
- A `recursion_level` field on the `Request` and `Response` structs
- A `--recursive` / `-r` flag
- A `--depth` option for the maximum recursion depth
- Domain filtering to stay within the input domains

Straightforward, right?

### Wrong

**The program wouldn't terminate.**

The termination logic was a `while curr < total_requests` loop:

```rust
let mut curr = 0;
while curr < total_requests {
    curr += 1;
    let response = recv_resp.recv().await.context("Receive channel closed")?;
    // ... process response, potentially incrementing total_requests
}
```

When responses arrive and generate new requests, `total_requests` goes up.
So far so good.  But extraction, sending, and receiving all happen **concurrently** across different tasks, so the count can get out of sync. 

I wasn't happy about it even at the time:

> TBH I'm not super happy with the current impl anymore as I count the links in the queue and then close the channel after all links got checked. It can lead to subtle bugs I think. There must be a better way.

Yes, Matthias from the past, the counter is fragile because:
- New links are discovered asynchronously, so `total_requests` can be bumped *after* the loop has already decided to exit.
- If the count is off by even one, you either hang forever (count too high) or quit too early (count too low).
- And to add insult to injury, every edge case made the counting logic gnarlier. Cached responses, failed responses, empty pages,...

[**@pawroman**](https://github.com/pawroman) gave me a genuinely thorough review here, including a careful analysis of memory usage for the `HashSet` cache (fine for up to millions of links), a suggestion to use signed depth values to express infinite recursion, and a nudge for integration tests. It was good feedback. It just couldn't fix the thing that was actually wrong, which was the whole approach to termination. 

### The Death Blow

In September 2021 we decided to do a bigger rewrite: a stream-based architecture ([PR #330](https://github.com/lycheeverse/lychee/pull/330)) to improve concurrency. It changed `Collector::collect_links` from returning a `Vec` to returning a `Stream`, removed the `ClientPool` abstraction, and reshaped how tasks talked to each other. That was a great improvement as it meant that the collector was lazy and we wouldn't allocate big `Vec`s of requests anymore. But it also meant that the recursion branch was borked and got its rug pulled from underneath. 

> Will put this on hold once again as we started implementing a stream-based approach in #330, which might supersede this branch soon. Sorry to everyone waiting on recursion support to land, but I'd like to get this right instead of merging a buggy solution prematurely.

[PR #165](https://github.com/lycheeverse/lychee/pull/165) was closed in December 2021. The stream refactor landed and gave us a 35–50% speedup. Nice! Tradeoffs, I guess.

{% info(title="Takeaways") %}

- **Counting outstanding work in an async pipeline is fragile.** An off-by-one in distributed counting means a deadlock or an early exit.
- **Big refactors and feature branches don't get along.** The stream rewrite made the recursion branch stale before it was ever ready.
- **Recursion touches almost every layer.** This isn't something you bolt on.

{% end %}

And one honest aside on the language question, because I get asked it a lot: the counting problem here is **not Rust's fault**. A Go version with goroutines and channels, or a Python asyncio version, would hit the same off-by-one bugs. The race between "response processed" and "new requests discovered" is inherent to any concurrent recursive crawler. Rust's `Stream` trait and the way it plays with ownership made a streaming architecture feel natural, and that's what invalidated the work. So that's perhaps a Rust-specific point. 

## Attempt 2: Feed It Back Through a Channel (January - July 2022)

Now that the stream architecture was in place, I took another stab at it. This time, instead of counting requests by hand, I'd [feed discovered URLs back through a *channel* connected to the collector](https://github.com/lycheeverse/lychee/pull/465).

The collector would read from an input channel and turn what it received into a stream of requests.
Recursion would just mean sending newly discovered URLs into that channel. (Look, a feedback loop!)
The stream would close naturally when the channel closed.

I also played with unifying the input type so one method could take either a `Vec` or a `Stream`:

```rust
pub enum InputType {
    Stream(Pin<Box<dyn Stream<Item = Input>>>),
    Seq(Vec<Input>),
}
```

**It hung. Again.** But for a completely different reason this time.

The feedback loop created a circular dependency:

1. The **collector** reads from an input channel and produces a stream of requests.
2. The **checker** reads requests and produces responses.
3. The **recursion handler** reads responses and sends new inputs back to the collector's channel.

Do you see the problem?

For the collector's stream to end, the input channel has to close.
For the channel to close, all senders have to be dropped.
But the recursion handler holds a sender; it needs one to push discovered URLs back.
And the recursion handler only stops when there are no more responses, which only happens when there are no more requests, which only happens when the collector's stream ends.
Another circular dependency causing a deadlock.

I said as much at the time:

> I had very little time to look at the issue so far, but it hangs because the input channel does not get dropped, leading to a dangling connection. I thought that the channel would be closed (and dropped) automatically once `futures::StreamExt::for_each_concurrent` finishes.

[**@untitaker**](https://github.com/untitaker) confirmed it and could reproduce the deadlock in even trivial cases:

> You want to drop the `sender` once there's nothing to process anymore right? But won't `for_each_concurrent` hang forever because you didn't do that yet? (and can't, because you need the sender for more cloning)

> I can repro a deadlock even with `time lychee --offline -b . '**/*.htm*' -T1` on an empty directory.

This is the heart of using channels for cyclic data flow: **channels use sender-drop as their termination signal, but in a cycle you can never drop all the senders, because each stage needs to hold one to keep the cycle alive.**

I took the problem to the Tokio Discord, and the advice that came back was: "Stop using channels for this. Use semaphores with `tokio::spawn` instead."

### The Performance Problem Too

Even ignoring the deadlock, there was a second issue. The new `from_chan` method benchmarked roughly 30% slower than the existing `from` method. The extra channel indirection cost something, and it cost it even in the non-recursive case, which is the case basically everyone uses.

{% info(title="Takeaways") %}

- **Channels are the wrong tool for cyclic pipelines.** Their close-on-last-sender-drop semantics are fundamentally at odds with a feedback loop.
- **`for_each_concurrent` looks perfect and isn't.** It processes a stream concurrently but gives you no way to feed items back in.
- **The common path can't get slower.** Recursion support is worthless if it taxes everyone who never uses it.

{% end %}

The channel-cycle deadlock is **inherent to any channel-based system**. Go channels have the same problem. Closing one means knowing nobody will send again, and a cycle makes that impossible. Erlang/OTP sidesteps it with process monitoring instead of channel semantics. The 30% regression, though, has a Rust angle. Rust's zero-cost-abstraction culture means people (me included) expect to pay nothing for features they don't use. In a runtime-heavy language, a 30% regression on an unused path might slide. In Rust, "you don't pay for what you don't use" is practically a moral position, and it made that regression a non-starter for me.

## Attempt 3: Semaphores (February 2022)

### What I Tried

I dropped channels for the recursion loop entirely and reached for:

- `Arc<Semaphore>` to cap concurrency (replacing the channel's natural backpressure)
- `tokio::spawn` for each unit of work (replacing `for_each_concurrent`)
- `OwnedSemaphorePermit` handed to each task, so work could be "transferred" when spawning a recursive sub-task

The [prototype](https://github.com/lycheeverse/lychee/pull/489) was pretty clean, honestly:

```rust
const MAX_CONCURRENCY: usize = 10;

fn recurse(permit: OwnedSemaphorePermit, i: usize) -> JoinHandle<()> {
    tokio::spawn(async move {
        handle_input(permit, i).await;
    })
}

async fn handle_input(permit: OwnedSemaphorePermit, i: usize) {
    println!("got = {i}");
    if i % 9 == 0 {
        recurse(permit, 10).await.unwrap();
    }
}
```

But I guess you can tell what the problem with it was: **it still locked up.**

When I tried to bring this model into the real codebase, the ownership requirements got ugly fast. The link checker needs the client config, the cache, the progress bar, the stats, and a handful of other things. To share all of that across spawned tasks, it all wanted to be wrapped in `Arc<RwLock<State>>`.
I tried this model on the branch, but it gets quite ugly because of ownership and `Send`. 

### Semaphores Aren't Enough

A semaphore solves the concurrency-limiting problem. It does nothing for the *termination* problem. With `tokio::spawn`, there's no built-in way to know when all spawned tasks — including the ones spawned recursively — have finished. You'd need a separate coordination mechanism, which is to say: you'd be reinventing the counter from Attempt 1, except now spread across an unbounded number of spawned tasks. We'd come full circle to the very thing I was trying to escape.

There's a subtlety with the permits, too. Swapping `for_each_concurrent` for raw `tokio::spawn` loses the bounded concurrency that channels gave us for free. The semaphore adds it back, but you have to manage permits carefully. If a task acquires a permit, spawns a child, and transfers the permit, the parent can't do more work. If it clones the permit, you can blow past your concurrency limit. Getting the permit lifecycle exactly right is fiddly.

{% info(title="Takeaways") %}

- **Semaphores solve concurrency, not termination.** You still need something to tell you "all the work is done."
- **`Arc<RwLock<State>>` is a code smell in async Rust.** When you start wrapping everything in locks, you're fighting the ownership model instead of working with it. That can leave a lot of performance on the table since every access is a lock acquisition across all threads.
- **The real question was never "how do I recurse?"** It was "how do I know when I'm done recursing."

{% end %}

This was the most Rust-specific failure of the bunch.
The semaphore approach is idiomatic in Go. A `sync.WaitGroup` plus a semaphore channel, with state shared across goroutines via `sync.Mutex` is how you'd do that in Golang because it has green threads and a runtime that manages goroutine lifecycles for you.

But in Rust, the `Send + 'static` bounds on `tokio::spawn`, the borrow checker's aversion to shared mutable state, and the cost of `Arc<RwLock<T>>` get in the way. Rust made the "just wrap everything in Arc and Mutex" escape hatch painful enough that it became a dead end. 

## 2022–2024 😴

For more than two years, the recursion issue kept collecting comments from people who wanted it.
People suggested workarounds (piping sitemap URLs through `xargs` was a popular one). The person who originally filed it built [their own tool](https://github.com/styfle/links-awakening) and moved on, which I completely understood.

I was honest about it whenever it came up:

Someone offered a €100 bounty. Others pointed to [muffet](https://github.com/raviqqe/muffet), which already does recursive checking. lychee wasn't standing still during these years; a lot of work went into performance, caching, rate limiting, and other features. But recursion was the elephant in the room. 

## Attempt 4: Gwenn Takes a Swing (January – March 2025)

In late 2024, a community contributor, [**@gwennlbh**](https://github.com/gwennlbh), [picked up the gauntlet](https://github.com/lycheeverse/lychee/pull/1603). Their plan went back to the channel-based model but with a twist: instead of trying to close channels for termination, they used an `Arc<AtomicUsize>` counter. Like Attempt 1, but atomic and shared across tasks!

And it looked so elegant: 

1. Keep the two existing mpsc channels (requests and responses).
2. After receiving a response, extract links from the body and send them as new requests.
3. Use the `Arc<AtomicUsize>` to track remaining work — increment when new requests are sent (recursive ones included), decrement when a response is processed, and break out of the receive loop when it hits zero.
4. Lean on the existing cache to avoid cycles (don't re-check URLs already seen).

This was the most functional attempt yet. It *actually worked* on real websites:

```sh
lychee -R https://endler.dev \
       --recursed-domains endler.dev
```

I was really excited watching it come together, and I tried to give useful design guidance along the way:
- Default recursion depth of 5
- Strict domain matching (no subdomain checking)
- Rate limiting deferred to a separate PR
- Breaking changes to `lychee-lib`'s public API accepted

### Where It Broke

And then it hit the same wall, from several directions at once.

#### 1. Channel Backpressure Deadlock

When recursion discovered a lot of links, the response handler tried to send new requests into the request channel. But if that channel was full (bounded by `max_concurrency`), the send blocked. A blocked response handler means no responses get processed, which means no request slots free up. **Classic backpressure deadlock.**

@gwennlbh worked around it by spawning the "send new requests" work in a separate `tokio::spawn`, decoupling response processing from request sending. It worked, but it meant there was no longer a limit on how many of these background tasks could pile up (and with that, use unbounded memory).

#### 2. Duplicate Requests

Because requests are processed in parallel, the same URL could be discovered by multiple pages and sent into the channel before any of them got cached. The cache check happened too late: after the request was already in flight. There was no per-URL synchronization to stop concurrent duplicates:

> Because of the parallel nature of the request-to-response task, it seems to me that sending the same request twice to the channel is hard to prevent. I tried adding guards basically everywhere [...] and I still seem to get duplicates.

As a stopgap, a dedup check went into `Stats::insert`, but that only stopped duplicate *reporting*, not duplicate *checking*. The real fix would arrive much later, with the `HostPool`'s per-URI `active_requests` mutex, but that machinery didn't exist yet.

#### 3. The Counter, Yet Again

The `Arc<AtomicUsize>` counter is, at heart, the same idea as Attempt 1 — and it brought the same fragility. With `Ordering::Relaxed` (the weakest memory ordering), increments and decrements across threads could be reordered, so the counter could briefly read zero before the work was actually done. On Wikipedia with `--max-depth=0`, it would lock up on the very last URL.

#### 4. Changes Everywhere

Adding `subsequent_uris` (the list of discovered links) to the `Response` type meant touching nearly every file that builds or consumes a `Response`. Every `Response::new()` call needed two new arguments (`vec![]` and `0` for the non-recursive case).

#### 5. The Collector Got Bypassed

To extract links from response bodies, the code built a fresh `Collector` inline in the checker, sidestepping the configured collector that respects user flags like `--exclude`, `--include`, and fragment checking.

### The End of That Road

After a burst of energy in January 2025, things slowed. Merge conflicts piled up. CI linting rules changed underneath the branch. @gwennlbh switched to Windows and couldn't get the OpenSSL dependency to build. In March 2025 they wrote, honestly:

> even though I was kinda denying it, it's pretty clear that I've lost motivation to keep working on this [...] I'm sorry T_T

I didn't want them to apologize. They got further than anyone, on a hard feature, in a complex async codebase, as a volunteer. My own note on the PR a while later was just the sober truth:

{% info(title="Takeaways") %}

- **The atomic counter is a manual counter in a trenchcoat.** It had the same failure modes. 
- When you're adding `vec![]` and `0` to every `Response::new()` call, that's a leaky abstraction.
- **Outside contributors face extra friction.** Build-environment differences, conflicts with a moving target, and the sheer cognitive load of a big async codebase make this an especially brutal feature to contribute.

{% end %}

How much of the issues were Rust-specific?
I'd say around half.
The backpressure is simply part of the problem space.
Any concurrent crawler in any language meets that.
The `Ordering::Relaxed` trap is somewhat Rust-specific in that Rust makes you *choose* a memory ordering (Go's `sync/atomic` does too, but most Go folks reach for `sync.WaitGroup` instead).

## So Why Is This Actually Hard?

Four attempts in five years.
If we take a step back, I think the difficulties can be grouped into a few categories: 

### Knowing When You're Done

Every implementation faced the same question: **how do you know when you're finished?**

In a non-recursive pipeline the answer is easy. You're done when the input stream is exhausted and the in-flight requests have completed.
Close the channel sender, drain the receiver, and Bob's your uncle. 

In a recursive pipeline the input stream is never truly exhausted, because every response might create new inputs. You need a separate way to detect *quiescence*: the state where nothing is in progress and nothing new will be generated.

Turns out, the problem has a name in distributed systems: ✨ **distributed termination detection**. ✨

The classic solutions ([Dijkstra–Scholten](https://en.wikipedia.org/wiki/Dijkstra%E2%80%93Scholten_algorithm), [token passing](https://en.wikipedia.org/wiki/Token_passing)) just don't map well onto Tokio's channel-based world.

### The Cycle

lychee's architecture is fundamentally a DAG.
Inputs flow one direction through the stages.
Recursion introduces a cycle.
And cycles in channel-based systems deadlock, because channels use "all senders dropped" as their done signal, and in a cycle that condition is never met on its own.

### Backpressure

Bounded channels give you natural backpressure: if the checker is slow, the sender blocks until there's room.
Which is lovely, until you want recursion.
Now the *response handler* needs to send into the *request channel*.
If that channel is full, the response handler blocks; if it blocks, no responses are consumed; if no responses are consumed, no request slots free up.

### Deduplication Races

We check links concurrently, which means multiple pages can hold the same link.
Without synchronization, several tasks discover the same URL and submit it before any of them can mark it "seen."
Through attempts 1–4 the cache didn't save us, because cache entries were written *after* checking, not before submission.

### Leaky Abstraction

Recursion-awareness wants to live "everywhere."
Responses need to carry discovered links, Requests need a depth, the collector needs to understand recursive inputs, stats and formatters need to handle duplicates.

### How Much of This Is Rust's Fault?

I think this is the question people reading my blog really want answered, so let me be direct.
My honest estimate is... **about 30%?**
The termination problem, the cycle problem, and the backpressure problem are all just part of the problem space. 
Any concurrent recursive crawler, be it written in Go, Python, Java, or Erlang, has to solve that.
At some point, [Scrapy](https://www.scrapy.org/), [Colly](https://github.com/gocolly/colly), and the other mature crawling frameworks all had to do distributed termination detection and backpressure management.

What Rust adds is friction at the implementation level:

- Ownership and `Send` bounds make it harder to share state across spawned tasks. In Go you capture variables in a goroutine closure and move on. In Rust everything in async-land wants to be `Arc`-wrapped and `Send + 'static`.
- Explicit memory ordering on atomics forces you to think about concurrency correctness and also makes "eh, just use relaxed" a tempting but dangerous choice. 
- Channel termination semantics in Tokio are stricter than in some other ecosystems. Go's `context.Context` gives you an orthogonal cancellation mechanism that Tokio channels don't natively have. (In Tokio, you'd use a [CancellationToken](https://tokio.rs/tokio/topics/shutdown) for that.)

But on the other side, Rust also prevented a lot of issues:

- The compiler caught every unsafe attempt to share mutable state. In Go those would've been subtle runtime bugs I'd find in production or maybe with the race detector.
- Using the type system in our favor, we can make the right thing be the ergonomic thing.

Put another way, Rust made the *wrong* approaches fail loudly and painfully e.g. with compiler errors (but also deadlocks in tests) and made the *right* approach more solid and ergonomic. 

## A New Hope

Despite all the failed attempts, the ground has quietly shifted under this problem in 2025–2026. A bunch of work, most of it not even about recursion, has made a real implementation finally look within reach.

### Per-Host Rate Limiting (PR #1929, Merged December 2025)

Recursion without rate limiting is dangerous.
Gwenn found that out firsthand by accidentally DDoS'ing their own WiFi router while recursively checking Wikipedia. 😬
Per-host rate limiting, which got merged in [PR #1929](https://github.com/lycheeverse/lychee/pull/1929), makes recursive crawling respect server limits.
I previously waved this off as "out of scope" but it's super important in practice.

The underlying issue ([#1605](https://github.com/lycheeverse/lychee/issues/1605)) was one I opened on January 6, 2025 — the same week [PR #1603](https://github.com/lycheeverse/lychee/pull/1603) (Attempt 4) opened. That timing was no accident. The moment we tried recursion for real, the lack of per-host rate limiting showed up as a glaring gap. It caused concurrent requests to the same host to throw 429s, the cache to be ineffective under high concurrency due to races (issue [#1593](https://github.com/lycheeverse/lychee/issues/1593)), and global concurrency settings being too coarse for a workload spread across many hosts at once.

The fix introduced a `HostPool`, which is a per-host request queue with configurable rate limits, delays, and concurrent-request caps.
Each host gets its own bucket with its own settings, configurable via `lychee.toml`:

```toml
[hosts."github.com"]
max_concurrent_requests = 10
request_delay = "100ms"
```

The `HostPool` would later become a central abstraction. It's the very same `HostPool` that [PR #2100](https://github.com/lycheeverse/lychee/pull/2100) reused to unify input fetching with link checking, which means it's now the single entrypoint that all HTTP requests flow through.

It's important for recursion because the `HostPool` gives us per-host rate limiting, deduplication (via each `Host`'s per-URI `active_requests` mutex and `HostCache`), and caching at the right granularity, which lets recursive crawling stay a good web citizen (respecting rate-limit headers, backing off on 429s).

### The WaitGroup (February 2026)

The single most important recent thing is the `WaitGroup` primitive, contributed by [Kait](https://github.com/katrinafyi) and merged in [PR #2046](https://github.com/lycheeverse/lychee/pull/2046).
It is one step towards solving the termination problem.

`WaitGroup` is a mechanism for waiting on a dynamic set of tasks that can themselves spawn more tasks. It's two pieces:

- `WaitGroup`, a single waiter that fires when all the work is done.
- `WaitGuard`, a cloneable guard held by each task. When the last guard is dropped, the waiter completes.

The key move is that a `WaitGuard` can be cloned. A task can spawn sub-tasks (recursion!) while preserving the invariant that the `WaitGroup` only completes once *every* guard — including the ones held by recursive sub-tasks — has been dropped.

That cleanly solves the termination problem:

```rust
let (waiter, guard) = WaitGroup::new();

// Each request carries a guard clone
send_req.send((guard.clone(), request)).await;

// In the response handler, if recursing:
// the guard is cloned for each new request
for new_request in discovered_links {
    send_req.send((guard.clone(), new_request)).await;
}

// The original guard is dropped when the response is fully processed.
// When ALL guards are dropped (no more work), waiter.wait() returns.
```

It's already wired into lychee's main check loop. The `collect_responses` function uses `take_until(waiter.wait())` to stop receiving when the work is done. There's even a comment in the current code anticipating exactly this:

```rust
// unused for now, but will be used for recursion eventually. by holding
// an extra `send_req` endpoint, we prevent the natural termination when
// each channel finishes and closes. instead, we rely on the WaitGroup to
// break the cyclic channels.
let _ = send_req;
```

That's the missing piece that our previous attempts lacked.

### Unified Request Handling (PR #2100, Merged March 2026)

[PR #2100](https://github.com/lycheeverse/lychee/pull/2100) unified input URL fetching with the link checker's `HostPool`. Before this, CLI input URLs went through a separate `reqwest::Client` that didn't share config (user-agent, rate limiting, TLS settings) with the checker. That caused real bugs (Wikipedia returning 403 for input URLs because no user-agent was set).

After it, input fetching and link checking go through the same pool. For recursion this matters because recursively discovered pages need to be fetched and parsed, and they should use the same client config as everything else.

### Sitemap Support (PR #2062)

[Sitemap support](https://github.com/lycheeverse/lychee/pull/2062) is a partial solution to a lot of recursion use cases. By parsing `sitemap.xml`, lychee can discover every page on a site without crawling recursively at all. It's not a replacement for true recursion (it doesn't help sites without sitemaps, and it won't find dynamically linked pages), but it unblocks a lot of use-cases. 

## What Proper Recursion *Could* Look Like

With all that in place, here's what's left. The striking part is how much of it is already done: 

- Knowing when the crawl is done is solved by the `WaitGroup`.
- Deadlocks are avoided by spawning the follow-up work instead of blocking on a full channel.
- The per-host pool already paces requests, so we don't hammer a server.
- lychee already skips URLs it has seen, which matters when every page links to the same nav and footer.
- **Getting the page back is the one open problem.** lychee throws the page away after checking it, but recursion needs the HTML to find more links. It's still in cache from the check that just happened, so we can grab it again for free. (Assuming the request method is GET, not a HEAD, which doesn't return a body.)

Once those are in, the actual recursion is just a handful of lines. When a checked page is on an allowed domain and under the depth limit, grab its content from cache, pull out the links, and send them back through the same pipeline as fresh requests:

```rust
if recursive && is_same_domain(&response, &recursion_domains) && depth < max_depth {
    let content = resolver.url_contents(response.url()).await?;  // cache hit
    let links = extractor.extract(&content);
    for req in request::create(links, ...) {
        send_req.send((guard.clone(), Ok(req))).await;
    }
}
```

The hard parts (knowing when to stop, not deadlocking, not flooding a server) are already solved by work that was never about recursion in the first place.
Recursion becomes a by-product of good architecture, not a special case bolted onto a pipeline that was never built for it.

## So, Did We Fail...?

I promised at the start I'd come back to this.

For a long time I told myself we'd failed. Four attempts, five years, seemingly nothing shipped.

But writing it all out changed how I see it. Every attempt hit some mix of channel termination semantics, backpressure deadlocks, ownership ergonomics, and distributed termination detection. None of those are lychee problems. They're hard concurrent-systems problems.
We just lacked the vocabulary to talk about them, and while I wasn't looking, those primitives got built. Sometimes the most important code you write for a feature is the code that never mentions the feature at all.

So no, I don't think we failed. We made progress by stumbling into the right direction.

Thanks to NLnet for funding the work on lychee, and to everyone who contributed to the recursion effort over the years, whether in code, design feedback, or moral support. It's been a long road, but we're closer than ever to the finish line.
