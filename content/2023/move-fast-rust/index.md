+++
title="How To Move Fast With Rust"
date=2023-10-25
draft=false
[taxonomies]
tags=["dev", "rust"]
[extra]
subtitle="Infrastructure is hard and costs time and money. There must be a better way."
+++

I've come a long way in my tech journey, from dealing with bare metal servers to
exploring the world of cloud computing. Initially, it seemed so straightforward
– spin up a server, deploy a container, and you're done. But as I delved deeper,
I realized that the ease of infrastructure is not as simple as it appears.

Cloud providers offer a multitude of tools, each with its own learning curve:

- Google Cloud / AWS
- Kubernetes
- Helm
- Docker
- Terraform
- GitHub Actions

If you're adventurous, you might even venture into managed Kubernetes services
like EKS or GKE. It's tempting, with just a few clicks, your application is
ready to roll. But the reality hits when you start juggling monitoring, logging,
security, scaling, and more.

Soon, you find yourself unintentionally leading a DevOps team instead of
focusing on your product. You hire more staff to manage infrastructure while
your competitors are shipping features and growing their user base.

## My Frustration

The cloud promised to make infrastructure easy, but the array of tools and
services can be overwhelming. Even if you don't use them all, you must be aware
of their existence and learn the basics. The result? Your focus on the product
diminishes.

I appreciate dealing with infrastructure, but I also love delivering a product.
Sadly, many companies waste precious time and money on infrastructure, repeating
the same mistakes.

What if there was a way to eliminate infrastructure concerns altogether?

## The Allure of Serverless

Serverless architecture seems promising - no servers, no containers, just pure
business logic. However, it's not without challenges:

- Cold start times
- Lambda size limitations
- Memory issues
- Long-running processes
- Debugging complexities
- Lack of local testing

Serverless has its merits for certain use cases, but for larger applications,
you might still need some servers.

## Platform-As-A-Service (PaaS)

Platforms like Heroku and Netlify introduced a third option – managed services
that handle all infrastructure for you. No more infrastructure concerns; you
simply push code, and it deploys. What's great about these solutions is their
deep integration with specific programming language ecosystems.

I was looking for a platform tailored for Rust developers, aiming to provide a
top-notch developer experience. I wanted deep integration with the Rust
ecosystem (serde, sqlx, axum,...).

A while ago, I came across Shuttle while trying to find ways to make my Rust
development workflow a bit smoother. It’s a tool that kind of just fits into the
existing Rust ecosystem, letting you use cargo as you normally would, but with
some of the infrastructural heavy lifting taken out of the picture. Now, it’s
not a magic wand that solves all problems, but what I appreciate about Shuttle
is its simplicity. You’re not thrown into a completely new environment with a
steep learning curve. Instead, you stick to your Rust code, and Shuttle is there
in the background, helping manage some of the server-side complexities. So, in
essence, it’s about sticking to what you know, while maybe making life a tad
easier when it comes to deployment and server management. It’s not about a
revolutionary change in how you code, but more about a subtle shift in managing
the background processes that can sometimes be a bit of a headache.

## My Shuttle Experience So Far

Until now, I built two smaller Rust services with Shuttle: Zerocal and Readable.

Shuttle takes your Rust code and with very few annotations, it can be
deployed to the cloud. The developer experience is pretty close to ideal
given that provisioning and deployment are usually the most painful parts of
building a service.

Instead, it's just a matter of adding a few lines of code. See for yourself.
The boilerplate just vanishes. What's left is the business logic.

 <video width="720" height="480" autoplay muted loop>
  <source src="video.mp4" type="video/mp4">
Your browser does not support the video tag. :( But the video is great.
</video> 



### Zerocal - Stateless Calendar Magic


The principle was very simple yet innovative: encode calendar data directly into a URL. This means creating an event was as straightforward as:

```sh
curl https://zerocal.shuttleapp.rs?start=2023-11-04+20:00&duration=3h&title=Birthday&description=paaarty
```

This would return an iCal file, that you can add to your calendar.
Here's how you create an event in the browser:

{{ figure(src="form.jpg") }}

I tried building this project on Shuttle when they were still fixing some things and changing their APIs here and there. Even with these small issues, it was a good experience. In just a few minutes, my app was up and running.

Here’s the code to start the service including the axum routes:

```rust
#[shuttle_runtime::main]
async fn axum() -> shuttle_axum::ShuttleAxum {
    // just normal axum routes
	let router = Router::new()
    		.route("/", get(calendar))
    		.route("/", post(calendar));

	Ok(router.into())
}
```

I don’t really need Zerocal for myself anymore, so I’m hoping someone else might
want to take it over. I think it could be really useful for sharing invites on
places like GitHub or Discord. If you want to know more about Zerocal, you can
read this detailed breakdown.

I would also like to mention that someone else built a similar project inspired
by Zerocal: kiwi by  Mahesh Sundaram, written in Deno. This is a really cool
outcome. 


### Bringing Clarity to the Web: A Reader Mode Proxy

My appreciation for Firefox's reader mode sparked the creation of a Reader Mode
Proxy for a minimalist, JavaScript-free web reading experience, particularly
tailored for e-readers. The intention was to transform verbose websites into a
more digestible format for distraction-free reading. This project resonated
deeply with my personal preferences, as I like simple apps that solve a problem.
With just a sprinkle of annotations, my code adapted smoothly to Shuttle's
environment. Initially, I had my own local mode, which allowed me to run the app
on my machine for testing, but I found no need to maintain that because
Shuttle’s own local mode works just as well.

While developing the app, there were some bumps along the road. Service
downtimes required some code revamping. Yet, Shuttle's evolution simplified
parts of my process, especially when it introduced native static file handling. 

Before it looked like this:

```rust
#[shuttle_runtime::main]
async fn axum() -> shuttle_axum::ShuttleAxum {
	let router = Router::new()
        // Previously, I needed to manually serve static files
    	.route(
        	"/static/Crimson.woff2",
        	get(|| async {
            	static_content(
                	include_bytes!("../static/fonts/Crimson.woff2",),
                	HeaderValue::from_static("text/woff2"),
            	)
        	}),
    	)
    	.route(
        	"/static/JetBrainsMono.woff2",
        	get(|| async {
            	static_content(
                	include_bytes!("../static/fonts/JetBrainsMono.woff2",),
                	HeaderValue::from_static("font/woff2"),
            	)
        	}),
    	)
    	.fallback(readable);

	Ok(router.into())
}
```

Now it’s just

```rust
#[shuttle_runtime::main]
async fn axum() -> shuttle_axum::ShuttleAxum {
   let router = Router::new()
    	.nest_service("/static", ServeDir::new(PathBuf::from("static")))
    	.fallback(readable);
	Ok(router.into())
}
```

A glance at this diff will show the difference. To understand the intricacies of
this project, here's a more comprehensive look.

## Control and Safety

Initially, I was concerned that annotating my code for infrastructure would
cause vendor lock-in. I wanted to retain full control over my project. Want to
move away? The Shuttle macros get rid of the boilerplate, so I could just remove
the 2 annotations I’ve added. Shuttle's code is also open source, so I could
even set up your self-hosted instance -- although I don't want to.

## The True Cost of DIY Infrastructure

Infrastructure may seem easy on the surface, but maintaining it involves various
complexities and costs. Updates, deployments, availability – it can be
overwhelming. Each hour spent on these tasks carries both a direct and
opportunity cost.

## Next Steps

Infrastructure can be a maze, and Shuttle seems to fit well for those working
with Rust. I'm thinking of trying out a larger project on Shuttle soon, now that
I've got a decent understanding of what Shuttle can and can't do. If you’re
considering giving it a shot, it's wise to check their
[pricing](https://www.shuttle.rs/pricing) to ensure it aligns with your needs. 

**Be mindful of the real cost of infrastructure!**

As I've mentioned before, it's
not just server costs, but a lot more. The biggest factor will probably be human
labor for maintenance and debugging infrastructure and that is expensive. If I
were to use infrastructure as code, I'd be spending many hours setting up my
infrastructure and a lot more to maintain it and that can be expensive, given
today's salaries.

Even if it was just for a hobby project, it would not be worth
the trouble for me. I’d much rather work on features than the code that runs it
all.

