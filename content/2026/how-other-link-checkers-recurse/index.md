+++
title="How Other Link Checkers Do Recursion"
date=2026-06-03
draft=false
[taxonomies]
tags=["rust", "dev", "lychee", "async"]
+++

After I published [Five Years of Trying to Add Recursion to lychee](@/2026/lychee-recursion/index.md), the most common reply I got was a very fair question:

> If recursion is so hard, how do *other* link checkers do it? Plenty of them already crawl websites!

The key takeaway is: **they didn't find a clever trick we missed.** They were built as crawlers from the very first commit, and I initially built lychee as a stream.

I went and read the source of the recursive checkers we list in [lychee's README](https://github.com/lycheeverse/lychee#features): [muffet](https://github.com/raviqqe/muffet) (Go), [LinkChecker](https://github.com/linkchecker/linkchecker) (Python), [linkinator](https://github.com/JustinBeckwith/linkinator) (TypeScript), and [broken-link-checker](https://github.com/stevenvachon/broken-link-checker) (JavaScript). This post is a teardown of how each one actually handles recursion, what it costs them, and what it means for lychee.

If you haven't read the [first post](@/2026/lychee-recursion/index.md), the summary is that lychee was architected as a one-shot, unidirectional pipeline (`inputs → extract → check → output`). Recursion needs a *cycle* (responses create new inputs), and cycles in an async, channel-based pipeline are where the [dragons live](@/2026/lychee-recursion/index.md). 🐲 Five years and four attempts later, the pieces we'll need to do it properly only *just* landed.

## DAGs vs. cycles 

Every recursive checker I looked at is built from the same three parts:
 
1. A mutable work queue (let's call it "frontier"), not a fixed input stream. Discovered URLs go back into the same queue they came from.
2. A visited set that's updated at enqueue time (before the request completes), so two pages discovering the same link can't both submit it.
3. A primitive that answers "is everything done?": a `WaitGroup`, a joinable-queue counter, an `onIdle()` promise, or a queue-drain event.

Diagrammatically, lychee is different from the others: 

{% mermaid() %}
graph TD
    subgraph crawler["Everyone else: a cycle"]
        direction TB
        CQ[Frontier queue] --> CW[Worker pool]
        CW --> CP[Fetch and parse page]
        CP -->|new links| CQ
        CP --> CR[Record result]
    end
    subgraph lychee["lychee: a DAG"]
        direction TB
        LA[Inputs] --> LB[Extractor]
        LB --> LC[Checker]
        LC --> LD[Results]
    end
{% end %}

Crawlers have a back-edge baked in. Our pipeline doesn't, and every one of my failed attempts was an effort to bend that back-edge into a graph that was never designed for it. 

Let's look at that graph design more closely: 

{% mermaid() %}
graph TD
    Seed[Seed URLs] --> Enq["Enqueue step: is URL in visited set?"]
    Enq -->|yes| Skip[Drop]
    Enq -->|no| Mark["Mark visited, then push"]
    Mark --> Q[Frontier queue]
    Q --> Pool["Worker pool, bounded concurrency"]
    Pool --> FP[Fetch page and extract links]
    FP -->|discovered links| Enq
    FP --> Rec[Record result]
    Q -.->|empty AND no worker busy| Stop[Terminate]
{% end %}

Note that the visited check happens in the **enqueue** step, atomically with the mark, before the worker ever touches the network. That ordering is the entire fix to the deduplication race that haunted lychee's attempts 1–4, where the cache was written *after* checking.

Each tool uses a variation on it.

## muffet (Go): a WaitGroup and a Set

[muffet](https://github.com/raviqqe/muffet) is closest in spirit to lychee: a fast, single-binary, concurrent website checker. 
The dedup + scheduling decision lives in one method (`page_checker.go`):

```go
func (c *pageChecker) addPage(p page) {
	if !c.donePages.Add(p.URL().String()) {
		c.daemonManager.Add(func() { c.checkPage(p) })
	}
}
```

`donePages` is a `concurrentStringSet` (a mutex-guarded `map[string]struct{}`). `Add` returns whether the URL was already present, so a page is only scheduled the *first* time it's seen. Dedup happens at enqueue, synchronized by the set's mutex. This is basically a line-by-line translation of the diagram above.

Checking a page fetches all of its links concurrently, and feeds qualifying ones back into `addPage`, the back-edge:

```go
go func(u string) {
	defer w.Done()
	status, p, err := c.fetcher.Fetch(u)
	// ...
	if !c.onePageOnly && p != nil && c.linkValidator.Validate(p.URL()) {
		c.addPage(p)   // recursion: discovered page re-enters the frontier
	}
}(u)
```

### How muffet knows it's done

muffet's answer to termination is a little `daemonManager` built around a `sync.WaitGroup` (`daemon_manager.go`):

```go
func (m daemonManager) Add(f func()) {
	m.waitGroup.Add(1)
	m.daemons <- func() {
		f()
		m.waitGroup.Done()
	}
}

func (m daemonManager) Run() {
	go func() {
		for f := range m.daemons {
			go f()
		}
	}()
	m.waitGroup.Wait()   // <- termination
}
```

Every scheduled page increments the group; every completed page decrements it; `Wait()` returns when the count hits zero. The whole crawl bootstraps with a single `addPage` before `Run()`, so the counter is positive before anyone waits on it.

This is the *same counter* I tried (and failed with) in [Attempt 1](@/2026/lychee-recursion/index.md) and [Attempt 4](@/2026/lychee-recursion/index.md). The difference is the invariant: `waitGroup.Add(1)` is only ever called from inside an already-running daemon that holds the count above zero (or from the bootstrap). There is no window where the counter briefly reads zero while work is still pending. Go's `WaitGroup` enforces this invariant so naturally that it doesn't feel like distributed termination detection at all, but that's exactly what it is. It's the moral equivalent of the `WaitGroup` primitive [Kait contributed to lychee in 2026](https://github.com/lycheeverse/lychee/pull/2046).

### Where the tradeoffs are

- Concurrency isn't bounded by the daemon manager. `Run()` does `go f()` for every task, spawning unbounded goroutines. The actual limiting happens downstream in a `semaphore` (a buffered-channel counting semaphore) and a per-host throttler pool. muffet *separates* "the frontier" from "the rate limiter," which is exactly the separation lychee lacked when it tried to use one bounded channel as both in the past.
- Cheap goroutines do a lot of heavy lifting. Spawning a goroutine per link is "fine" in Go. The equivalent in Rust (`tokio::spawn` per link, each needing `Send + 'static` state) is what pushed me toward `Arc<RwLock<…>>` and the ownership pain I [wrote about](@/2026/lychee-recursion/index.md#attempt-3-semaphores-february-2022).
- On extensibility, muffet is a focused CLI, not a library. There's no plugin surface; you get what the flags give you. lychee deliberately ships `lychee-lib` as a reusable crate, which raises the bar, since every architectural choice has to uphold the standards of a public API. 
- On scalability, unbounded goroutines plus an in-memory visited set scale comfortably to large sites, but there's no disk-backed frontier, so a truly enormous crawl is bounded by RAM. Same as lychee.

{% info(title="Takeaways: muffet") %}

- muffet's termination is a `sync.WaitGroup`, full stop. It's the design lychee converged on after five years; muffet got it for free from Go's standard library on day one.
- The frontier and the concurrency limiter are separate things. A mutex-guarded set is the frontier; a semaphore plus host throttler bounds concurrency. Conflating them is what deadlocked lychee.
- Goroutines hide the cost that Rust makes you pay explicitly. The same per-task model that's trivial in Go is where Rust's `Send`/ownership friction shows up.

{% end %}

## LinkChecker (Python): a joinable unbounded queue 

[LinkChecker](https://github.com/linkchecker/linkchecker) has existed since the year 2000. It's a synchronous, thread-pool crawler.

Its frontier is a hand-written `UrlQueue` (`cache/urlqueue.py`), a clone of Python's `queue.Queue` with `task_done()`/`join()`. Look at the very first design comment:

```python
def __init__(self, max_allowed_urls=None):
    # Note: don't put a maximum size on the queue since it would
    # lead to deadlocks when all worker threads called put().
    self.queue = collections.deque()
    # ...
    self.unfinished_tasks = 0
```

It's explicit about the exact deadlock that bit me.

That comment is *our [Attempt 4 backpressure deadlock](@/2026/lychee-recursion/index.md#attempt-4-gwenn-takes-a-swing-january-march-2025)*, called out and designed around. lychee tried to push discovered URLs into a **bounded** channel; when it filled, the response handler blocked, no responses drained, no slots freed. Deadlock. 💥

LinkChecker's answer is brutalist in nature: the frontier is **unbounded**.
Backpressure is enforced elsewhere (a fixed thread count and per-host throttling), never by blocking a producer that is also a consumer.


### Termination by counter, done right

`join()` blocks until `unfinished_tasks` hits zero (`urlqueue.py`):

```python
def task_done(self, url_data):
    with self.all_tasks_done:
        self.finished_tasks += 1
        self.unfinished_tasks -= 1
        self.in_progress -= 1
        if self.unfinished_tasks <= 0:
            self.all_tasks_done.notify_all()

def join(self, timeout=None):
    with self.all_tasks_done:
        while self.unfinished_tasks:
            self.all_tasks_done.wait()
```

Again: a counter. But the increment in `_put` and the decrement in `task_done` are both inside the queue's `Condition` lock, and a worker calls `task_done` only after fully processing an item *including enqueuing its children*. So children are counted before the parent is marked done, with no premature zero. It's `WaitGroup` semantics implemented with a mutex and a condition variable.

### Deduplication, before the request

LinkChecker writes the URL into its result cache at **enqueue** time (`urlqueue.py`):

```python
def _put(self, url_data):
    key = url_data.cache_url
    cache = url_data.aggregate.result_cache
    if cache.has_result(key):
        return  # already queued/checked -> skip
    # ...
    self.queue.append(url_data)
    self.unfinished_tasks += 1
    # add a None placeholder so this URL is never queued twice
    cache.add_result(key, None)
```

That `add_result(key, None)` sentinel is a "fix" that's missing in lychee's attempts. By the time any worker thread checks the URL, the cache already says "mine," so concurrent discovery from another page is a no-op.

### Per-host politeness and termination guards

The `Aggregate` (`director/aggregator.py`) throttles per host:

```python
@synchronized(_hosts_lock)
def wait_for_host(self, host):
    t = time.time()
    if host in self.times and self.times[host] > t:
        time.sleep(self.times[host] - t)
    # spread requests using maxrequestspersecond
    wait_time = random.uniform(wait_time_min, wait_time_max)
    self.times[host] = time.time() + wait_time
```

and `abort()` calls `urlqueue.join(timeout=…)` so a stuck crawl can't hang forever.

### Where the tradeoffs are

- Blocking threads instead of async. Each of the (default 10–100) `Checker` threads does blocking I/O via `requests`. Simple and battle-tested, but the concurrency ceiling is the thread count, and each thread carries a full stack. lychee's Tokio model reaches thousands of concurrent in-flight requests on a handful of OS threads; LinkChecker can't, and doesn't try.
- The unbounded frontier trades a deadlock for unbounded memory. The explicit "no max size" decision means RAM growth on huge sites. There's a `max_allowed_urls` cap and a periodic `cleanup()` to mitigate it.
- Extensibility is excellent. LinkChecker has a real plugin system (`linkcheck/plugins/`: anchor checks, SSL, virus scanning, and more) and many output loggers. This is the most extensible of the bunch, and it pays for that with a large, mature, somewhat old-fashioned codebase.
- On scalability, it's GIL-bound and thread-limited, so raw throughput is the lowest here, but correctness and feature coverage are high.

{% info(title="Takeaways: LinkChecker") %}

- The unbounded frontier is a deliberate anti-deadlock choice, documented in a one-line comment. It describes the exact problem we hit in lychee in attempt 4.
- Dedup at `put()` time (a `None` placeholder in the cache) is their synchronization mechanism. The cache must claim the URL *before* the request, not after.
- Threads buy simplicity at the cost of throughput. A blocking thread pool is the easiest correct model... and the slowest one.

{% end %}

## linkinator (TypeScript): Single-Threaded `queue.onIdle()`

[linkinator](https://github.com/JustinBeckwith/linkinator) is a Node.js checker, and it benefits from something neither Go nor Rust provides: a **single-threaded event loop**. Check-and-insert into the visited set is atomic *for free*, because no two callbacks run simultaneously.

The frontier is a concurrency-limited `Queue` (a p-queue-style structure). Termination is one line in `check()` (`src/index.ts`):

```ts
const queue = new Queue({ concurrency: options.concurrency || 100 });
// ... seed the queue ...
// resolve when nothing is queued or running:
await queue.onIdle();  
```

`onIdle()` is the library's termination detection: it resolves when the queue is empty *and* no task is in flight. Same idea as muffet's `WaitGroup` and LinkChecker's `join()`, just expressed as a promise and backed by a single-threaded runtime, so no Mutex is needed to protect the visited set.

### The back-edge and the race-free dedup

When crawling, `crawl()` GETs the page, extracts links, and for each new URL re-enters the queue (`src/index.ts`):

```ts
const inCache = options.cache.has(result.url.href);
if (!inCache) {
    // Mark visited...
    options.cache.add(result.url.href);
    
    // Create the promise for this check
    const checkPromise = (async () => {
        await this.crawl({ url: result.url, /* ... */ });
    })();
    
    // Store the promise.
    // Another page discovering the same URL can wait on this promise
    // instead of enqueuing a duplicate check.
    options.pendingChecks.set(result.url.href, checkPromise);
    
    // Enqueue...
    options.queue.add(() => checkPromise);        
}
```

Because JavaScript is single-threaded, the entire thing executes without interruption.
In Rust or Go, that's a critical section you must guard with a mutex (and get the ordering right); in Node it's just three statements. This is the single biggest reason recursion is *easier* in Node than in Rust.
It's just a language feature.

linkinator also keeps a `relationshipCache` of `` `${url}|${parent}` `` keys, and a `pendingChecks` map so it can wait on an in-flight check and still report a *duplicate broken link* against every parent that references it. Those reuse-operations are themselves pushed onto the same queue, so `onIdle()` correctly waits for them too.

### HEAD vs GET

linkinator uses `HEAD` for leaf links but `GET` when it needs to crawl, because **recursion needs the response body to find more links**:

```ts
response = await makeRequest(
  options.crawl ? 'GET' : 'HEAD',
  options.url.href, /* ... */
);
```

This is precisely [lychee's remaining open problem](@/2026/lychee-recursion/index.md#what-proper-recursion-could-look-like): you can only recurse into pages you fetched with a body. linkinator just always GETs when crawling; lychee plans to reuse the body it already has in cache from the check it just performed.

### Where the tradeoffs are

- Single-threaded is both a blessing and a ceiling. No data races, trivially correct dedup, but HTML parsing is CPU work that blocks the one event loop. For thousands of pages, you're bound by a single core. lychee's multi-threaded runtime parses and checks in parallel.
- It suffers from in-memory result inflation. The source explicitly comments on "massive result inflation for heavily interlinked sites": the `results` array, `cache`, and `relationshipCache` all grow with the crawl. Fine for a docs site, heavy for a giant one.
- Rate limiting is reactive, not proactive. There's a `delayCache` that backs off per host on a `429` with `Retry-After`, but no general per-host concurrency cap like lychee's `HostPool`. linkinator can hammer a host until it complains; lychee now paces *before* the complaint.
- For extensibility, it's an `EventEmitter` (`on('link')`, `on('pagestart')`, and so on), so it's embeddable and scriptable, which is nice. It's a library first, like lychee.

{% info(title="Takeaways: linkinator") %}

- `queue.onIdle()` is the termination mechanism. Simple and provided by the JS runtime.
- A single-threaded event loop makes request deduplication pretty much free. This is the biggest structural reason recursion is easier in that case.
- Reactive 429 backoff is not the same as proactive per-host pacing. lychee's `HostPool` aims higher, at the cost of more machinery.

{% end %}

## broken-link-checker (JavaScript): event-driven, using two queues

[broken-link-checker](https://github.com/stevenvachon/broken-link-checker) (BLC) takes the event-driven model furthest. It's built on [`limited-request-queue`](https://github.com/stevenvachon/limited-request-queue), a queue with `maxSockets` (concurrency) and `rateLimit`, and it nests **two** of them: a site-level queue feeding a page-level `HtmlUrlChecker`.

The frontier and dedup live in `SiteChecker` (`lib/public/SiteChecker.js`). Visited pages are tracked in a `URLCache`, written at enqueue time:

```js
#enqueuePage(url, customData, auth) {
    // Mark before crawl to avoid links to self within page. 
    this.#sitePagesChecked.set(url, PAGE_WAS_CHECKED);
    this.#htmlUrlChecker.enqueue(url, customData, auth);
}
```

Recursion is governed by a filter that decides whether a discovered link becomes a crawled page:

```js
#maybeEnqueuePage(link, customData, auth) {
    const tagGroup = this.#options.tags.recursive[
      this.#options.filterLevel
    ][link.get(HTML_TAG_NAME)] ?? {};
    
    const attrSupported = link.get(HTML_ATTR_NAME) in tagGroup;
    if (!attrSupported ||
        link.get(IS_BROKEN) ||
        !link.get(IS_INTERNAL) ||
        this.#sitePagesChecked.has(rebasedURL) || // dedup check
        !this.#isAllowed(link)) { // robots.txt
          // do nothing
    } else if (this.#options.includePage(rebasedURL)) {
        this.#enqueuePage(rebasedURL, customData, auth);
    }
}
```

### Termination by event cascade

BLC has no counter and no `onIdle()`. It rides the queue's drain events. When the page-level queue empties it fires `END_EVENT`, which makes `SiteChecker` emit `SITE_EVENT` and call the site queue's `done` callback; when the *site* queue drains, it fires `REQUEST_QUEUE_END_EVENT`. That's the public `END_EVENT`:

```js
.on(END_EVENT, () => {
    this.emit(SITE_EVENT, this.#currentPageError, this.#currentSiteURL, this.#currentCustomData);
    this.#currentDone();   // tell the site queue this site is finished
});
```

That's their termination detection, expressed as "the request queue reported empty."

And in classic Node.js fashion, the `done` callback is what actually tells the site queue to free up a slot for another site. So the termination of one site is what allows another to start, and the termination of the whole crawl is what allows the process to exit. It's a cascade of events that propagates from the page queue to the site queue to the process.

### Where the tradeoffs are

- It's the best web citizen of the bunch. robots.txt is honored (`getRobotsTxt`, `isAllowed`), `rel=nofollow` is respected, and `rateLimit` plus `maxSockets` are first-class. This is a crawler that's polite by default.
- Event cascades are powerful but fiddly. Termination is spread across half a dozen event handlers and two nested queues. It works, but the control flow is much harder to follow than `await queue.onIdle()`. This is the JS cousin of the "leaky abstraction" problem I described, where recursion-awareness ends up sprinkled across many handlers.
- It's single-threaded, the same ceiling as linkinator, plus the in-memory `URLCache` per site.
- On maturity versus momentum, it's very widely used (it powers a lot of tooling), but development has slowed. The architecture is still sound and worth studying.

{% info(title="Takeaways: broken-link-checker") %}

- Termination is a cascade of queue-drain events, not a counter. Same idea, different syntax. 
- Politeness is built in. robots.txt, `rateLimit`, and `maxSockets` make it the most server-friendly recursive checker by default.
- Event-driven control flow is the cost. Distributing recursion logic across many handlers is exactly the kind of spread-out complexity that makes the feature hard to reason about.

{% end %}

## A note on markdown-link-check and the "industrial" crawlers

Our README marks [markdown-link-check](https://github.com/tcort/markdown-link-check) as supporting recursion, but there's some nuance there: it recurses over *Markdown files*, not by spidering a live website. There's no HTTP frontier and no termination problem in the sense above. Worth a mention so the comparison is honest, not worth a teardown.

If you want to see the pattern at full industrial scale, look at [Scrapy](https://www.scrapy.org/) (Python/Twisted) or [Colly](https://github.com/gocolly/colly) (Go). Both use the same approach: a scheduler (frontier) with a pluggable, optionally disk-backed queue, a dupefilter (often a Bloom filter rather than a `HashSet`), a bounded downloader pool, and explicit "engine idle → close spider" termination. They solve exactly the problems lychee struggled with ([distributed termination detection](https://en.wikipedia.org/wiki/Dijkstra%E2%80%93Scholten_algorithm), backpressure, dedup), just with years of dedicated crawler engineering behind them. The takeaway isn't "lychee should be Scrapy": it's that crawling is a well-trodden architecture, and lychee is simply standing on a different one right now.

## Side-by-side

{% wide_table() %}
| Tool | Lang / runtime | Concurrency model | Frontier | "Done?" signal | Dedup point | Per-host limiting |
| --- | --- | --- | --- | --- | --- | --- |
| **muffet** | Go, goroutines | goroutine pool + semaphore + host throttler | mutex-guarded set + daemon channel | `sync.WaitGroup` | visited set at enqueue | host throttler pool |
| **LinkChecker** | Python, threads | fixed blocking thread pool | **unbounded** `UrlQueue` | joinable-queue counter (`join()`) | result cache at `put()` | `wait_for_host` (req/s) |
| **linkinator** | Node, event loop | single-thread + p-queue (`concurrency`) | p-queue | `queue.onIdle()` | `Set` at enqueue (race-free) | reactive `429` `delayCache` |
| **broken-link-checker** | Node, event loop | `limited-request-queue` (`maxSockets`) | nested request queues | queue-drain events | `URLCache` at enqueue | `maxSockets` + `rateLimit` |
| **lychee (2026)** | Rust, Tokio | tasks + `HostPool` | channels + `WaitGroup` | `WaitGroup` | `HostPool` `active_requests` | `HostPool` per-host pool |
{% end %}

lychee in 2026 finally has a column-for-column match. The `WaitGroup` is muffet's `sync.WaitGroup` and LinkChecker's `join()`. The `HostPool` is BLC's `rateLimit`/`maxSockets` and LinkChecker's `wait_for_host`. The per-URI `active_requests` mutex is everyone's enqueue-time dedup.

## So Why Couldn't We Just Copy Them?

Three reasons, in increasing order of how much they're actually lychee's fault.

**They started as crawlers; lychee started as a stream.**

Every tool above has a back-edge in its core data structure. lychee's core was a DAG optimized for the 99% case (a list of files/URLs, checked once, fast). Retrofitting a cycle onto a pipeline is much harder than having one from the start. The problem is architectural in nature. 

**The frontier and the rate-limiter must be different objects.**

muffet (set + semaphore), LinkChecker (unbounded queue + thread count), linkinator (p-queue + delayCache), BLC (request queue + maxSockets) all keep "what to do next" separate from "how fast to go." lychee's early attempts tried to make one bounded channel serve both roles, and a cycle through a bounded channel deadlocks. The fix (lychee's `HostPool` plus a `WaitGroup` over an unbounded work source) is the same separation we're aiming for now.

**Single-threaded runtimes get dedup for free.**

Both Node tools dedup with a plain `Set` and zero locking, because the event loop serializes access. Go and Python pay a mutex. Rust pays a mutex *and* fights the borrow checker about who owns the shared state across `tokio::spawn`. That's the ~30% "Rust tax" I [estimated last time](@/2026/lychee-recursion/index.md#how-much-of-this-is-rust-s-fault): not the algorithm, but the friction of expressing shared mutable frontier state under `Send + 'static`.

None of this is a knock on lychee's design. A unidirectional stream is *the right call* for the common, non-recursive case: it's why lychee is fast and why the 30% channel regression from [Attempt 2](@/2026/lychee-recursion/index.md) was a dealbreaker. The other tools pay for their back-edge on every run, recursive or not. lychee refused to, and that principle is exactly why recursion took five years and why, when it lands, it won't slow down the path everyone actually uses.
I believe that we can have our cake and eat it too: a crawler architecture that supports recursion without sacrificing the speed of a one-shot pipeline. But it's a harder problem than just "copy what they do," because most link checkers didn't start with uncompromising performance as their top goal. 

{% info(title="Key takeaways") %}

- There is no secret sauce. Every recursive checker is a worklist plus a visited set plus a quiescence detector. The "trick" is being shaped like a crawler from commit one.
- Termination is always the same idea wearing different clothes: `sync.WaitGroup` (muffet), joinable-queue counter (LinkChecker), `queue.onIdle()` (linkinator), queue-drain events (BLC), `WaitGroup` (lychee 2026). All of them are distributed termination detection.
- Dedup belongs at enqueue, before the request. Marking a URL visited *after* checking it (what lychee did for four attempts) is the bug. Everyone else claims the URL the moment it enters the frontier.
- Separate the frontier from the rate limiter. A bounded channel that is both your queue *and* your backpressure will deadlock the instant you add a cycle.
- There is no free lunch. Node's single thread makes dedup trivial at the cost of performance; Go's goroutines and `WaitGroup` make termination trivial at the cost of a runtime; Rust gives you neither for free but hands you a compiler that refuses to let the races compile and you can get the network card to glow if you know exactly what you are doing. 

{% end %}

So when someone asks "how do other link checkers do recursion?", the real answer is: they made it a part of the architecture from the beginning, and they leaned on a runtime (providing conveniences like a `WaitGroup`, a joinable queue, an idle promise) that solved termination without solving "distributed termination detection."

Thanks to the maintainers of muffet, LinkChecker, linkinator, and broken-link-checker: reading your source is the clearest way to learn about crawler architecture out there and we're all in this together, just with a different set of tradeoffs.
