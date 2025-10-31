+++
title="Building Up And Sanding Down"
date=2025-10-31
draft=false
[taxonomies]
tags=["dev"]
+++

Over the years, I've gravitated toward two complementary ways to build robust software systems: building up and sanding down.

**Building up** means starting with a tiny core and gradually adding functionality. 
**Sanding down** means starting with a very rough idea and refining it over time.

Neither approach is inherently better; it's almost a stylistic decision that depends on team dynamics and familiarity with the problem domain.
On top of that, my thoughts on the topic are not particularly novel, but I wanted to summarize what I've learned over the years. 

## Building Up

{{ figure(src="stonework.jpg", caption="Working on a solid stone block in ancient Egypt",  credits="[Wikimedia](https://commons.wikimedia.org/wiki/File:%C3%84gypten_Steinbearbeitung.png) Public Domain") }}

Building up focuses on creating a solid foundation first.
I like to use it when working on systems I know well or when there is a clear specification I can refer to.
For example, I use it for implementing protocols or when emulating hardware such as for my [MOS 6502 emulator](https://github.com/mre/mos6502).

I prefer "building up" over "bottom-up" as the former evokes construction and upward growth. "Bottom-up" is more abstract and directional.
Also "bottom-up" always felt like jargon while "building up" is more intuitive and very visual, so it could help communicate the idea to non-technical stakeholders.

There are a few rules I try to follow when building up:
- Focus on atomic building blocks that are easily composable and testable.
- Build up powerful guarantees from simple, verifiable properties.
- Focus on correctness, not performance.
- Write the documentation along with the code to test your reasoning.
- Nail the abstractions before moving on to the next layer.

When I collaborate with highly analytical people, this approach works well.
People who have a background in formal methods or mathematics tend to think in terms of "building blocks" and proofs.
I also found that functional programmers tend to prefer this approach.

In languages like Rust, the type system can help enforce invariants and make it easier to build up complex systems from simple components.
Also, Rust's trait system encourages composition, which aligns well with that line of thinking.

The downside of the "build up" approach is that you end up spending a lot of time on the foundational layers before you can see any tangible results.
It can be slow to get to an MVP this way.
Some people also find this approach too rigid and inflexible, as it can be hard to pivot or change direction once you've committed to a certain architecture.

For example, say you're building a web framework.
There are a ton of questions at the beginning of the project: 

- Will it be synchronous or asynchronous?
- How will the request routing work?
- Will there be middleware? How? 
- How will the response generation work?
- How will error handling be done?

In a building-up approach, you would start by answering these questions and designing the core abstractions first.
Foundational components like the request and response types, the router, and the middleware system are the backbone of the framework and have to be rock solid.

Only after you've pinned down the core data structures and their interactions would you move on to building the public API. 
This can lead to a very robust and well-designed system, but it can also take a long time to get there.

For instance, [here](https://docs.rs/http/latest/src/http/request.rs.html#158) is the `Request` struct from the popular `http` crate:

```rust
#[derive(Clone)]
pub struct Request<T> {
    head: Parts,
    body: T,
}

/// Component parts of an HTTP `Request`
///
/// The HTTP request head consists of a method, uri, version, and a set of
/// header fields.
#[derive(Clone)]
pub struct Parts {
    /// The request's method
    pub method: Method,

    /// The request's URI
    pub uri: Uri,

    /// The request's version
    pub version: Version,

    /// The request's headers
    pub headers: HeaderMap<HeaderValue>,

    /// The request's extensions
    pub extensions: Extensions,

    _priv: (),
}
```

There are quite a few clever design decisions in this short piece of code:
- The `Request` struct is generic over the body type `T`, allowing for flexibility in how the body is represented (e.g., as a byte stream, a string, etc.).
- The `Parts` struct is separated from the `Request` struct, allowing for easy access to the request metadata without needing to deal with the body.
- `Extensions` can be used to store extra data derived from the underlying protocol.
- The `_priv: ()` field is a zero-sized type used to prevent external code from constructing `Parts` directly. It enforces the use of the provided constructors and ensures that the invariants of the `Parts` struct are maintained.

With the exception of extensions, this design has stood the test of time.
It has remained largely unchanged since the [very first version](https://github.com/hyperium/http/commit/0858e716984c95d2dd0c04f57a228e324ebc0f41) in 2017.

## Sanding Down

{{ figure(src="Rekhmire-tomb-drawing-furniture.jpg", caption="Drawing of the part of wall painting in the tomb of Rekhmire",  credits="[Wikimedia](https://commons.wikimedia.org/wiki/File:Rekhmire-tomb-drawing-furniture.jpg) Public Domain") }}

The alternative approach, which I found to work equally well, is "sanding down."
In this approach, you start with a rough prototype (or vertical slice) and refine it over time.
You "sand down" the rough edges over and over again, until you are happy with the result.
It feels a bit like woodworking, where you start with a rough piece of wood and gradually refine it into a work of art.
(Not that I have any idea what woodworking is like, but I imagine it's something like that.)

Crucially, this is similar but not identical to prototyping.
The difference is that you don't plan on throwing away the code you write.
Instead, you're trying to exploit the iterative nature of the problem and purposefully work on "drafts" until you get to the final version. 
At any point in time you can stop and ship the current version if needed.

I find that this approach works well when working on creative projects which require experimentation and quick iteration. 
People with a background in game development or scripting languages tend to prefer this approach, as they are used to working in a more exploratory way.

When using this approach, I try to follow these rules:

- Switch off your inner perfectionist.
- Don't edit while writing the first draft.
- Code duplication is strictly allowed.
- Refactor, refactor, refactor.
- Defer testing until after the first draft is done.
- Focus on the outermost API first; nail that, then polish the internals.

This approach makes it easy to throw code away and try something new.
I found that it can be frustrating for people who like to plan ahead and are very organized and methodical.
The "chaos" seems to be off-putting for some people.

As an example, say you're writing a game in Rust.
You might want to tweak all aspects of the game and quickly iterate on the gameplay mechanics until they feel "just right."

In order to do so, you might start with a skeleton of the game loop and nothing else.
Then you add a player character that can move around the screen.
You tweak the jump height and movement speed until it *feels good*.
There is very little abstraction between you and the game logic at this point.
You might have a lot of duplicated code and hardcoded values, but that's okay for now.
Once the core gameplay mechanics are pinned down, you can start refactoring the code.

I think Rust can get in the way if you use [Bevy](https://bevy.org/) or other frameworks early on in the game design process.
The entity component system can feel quite heavy and hinder rapid iteration.
(At least that's how I felt when I tried Bevy last time.)

I had a much better experience creating my own window and rendering loop using [macroquad](https://macroquad.rs/).
Yes, the entire code was in one file and no, there were no tests.
There also wasn't any architecture to speak of.

And yet... working on the game felt amazing!
I knew that I could always refactor the code later, but I wanted to stay in the moment and get the gameplay right first.

Here's [my game loop](https://github.com/mre/red/blob/4d798f88d2b9de18619c875bff6d5c75f4a4dcc3/src/main.rs#L285C1-L304C2), which was extremely imperative and didn't require learning a big framework to get started:

```rust
#[macroquad::main("Game")]
async fn main() {
    let mut player = Player::new();
    let input_handler = InputHandler::new();

    clear_background(BLACK);
    loop {
        // Get inputs - only once per frame
        let movement = input_handler.get_movement();
        let action = input_handler.get_action();

        // Update player with both movement and action inputs
        player.update(&movement, &action, get_frame_time());

        // Draw
        player.draw();

        next_frame().await
    }
}
```

You don't have to be a Rust expert to understand this code.

In every loop iteration, I simply: 
- get the inputs
- update the player state
- draw the player
- wait for the next frame

It's a very typical design for that type of work.

If I wanted to, I could now sand down the code and refactor it into a more modular design until it's production-ready.
I could introduce a "listener/callback" system to separate input handling from player logic or a scene graph to manage multiple game objects or an ontology system to manage game entities and their components.
But why bother?
For now, I care about the game mechanics, not the architecture.

## Finding the Right Balance

Both variants can lead to correct, maintainable, and efficient systems.
There is no better or worse approach.

I found that most people gravitate toward one approach or the other.
However, it helps to be familiar with both approaches and know when to apply which mode. 
Choose wisely, because switching between the two approaches is quite tricky as you start from different ends of the problem.