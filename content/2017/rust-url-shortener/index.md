+++
title="Launching a URL Shortener in Rust using Rocket"
date=2017-04-09

[extra]
comments = [
  {name = "Reddit", url = "https://www.reddit.com/r/programming/comments/64li3l/launching_a_url_shortener_in_rust_using_rocket/"},
  {name = "Twitter", url = "https://twitter.com/matthiasendler/status/851128136624480256"}
]
+++

One common Systems Design task in interviews is to sketch the software architecture of a URL shortener (a [bit.ly](https://bit.ly) clone, so to say).
Since I was playing around with Rocket, why not give it a try?

<!-- more -->

{{ figure(src="./rocket.svg", caption="A rocket travelling through space") }}

## Requirements 

A URL shortener has two main responsibilities:

* Create a shorter URL from a longer one (d'oh)
* Redirect to the longer link when the short link is requested.

Let's call our service `rust.ly` (*Hint, hint:* the domain is still available at the time of writing...).

First, we create a new Rust project:

```rust
cargo new --bin rustly
```

Next, we add Rocket to our `Cargo.toml`:

```rust
[dependencies]
rocket = "0.2.4"
rocket_codegen = "0.2.4"
```

Warning: Most likely you need to get the very newest Rocket version.
Otherwise, you might get some entertaining error messages. Check out the newest
version from [crates.io](https://crates.io/crates/rocket).

Since Rocket requires cutting-edge Rust features, we need to use a recent nightly
build. [Rustup](http://rustup.rs/) provides a simple way to switch between stable and nightly.

```Rust
rustup update && rustup override set nightly
```


## A first prototype

Now we can start coding our little service.
Let's first write a simple "hello world" skeleton to get started.
Put this into `src/main.rs`:

```rust
#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket;

#[get("/<id>")]
fn lookup(id: &str) -> String {
    format!("⏩ You requested {}. Wonderful!", id)
}

#[get("/<url>")]
fn shorten(url: &str) -> String {
    format!("💾 You shortened {}. Magnificient!", url)
}

fn main() {
    rocket::ignite().mount("/", routes![lookup])
                    .mount("/shorten", routes![shorten])
                    .launch();
}
```

Under the hood, Rocket is doing some magic to enable this nice syntax.
More specifically, we use the `rocket_codegen` crate for that.
(It's implemented as a compiler plugin, which is also the reason why we need to use nightly Rust.)

In order to bring the rocket library into scope, we write `extern crate rocket;`.

We defined the two *routes* for our service. Both routes will respond to a `GET` request.  
This is done by adding an *attribute* named `get` to a function.
The attribute can take additional arguments.
In our case, we define an `id` variable for the `lookup` endpoint and a `url` variable for the `shorten` endpoint. 
Both variables are Unicode string slices. Since Rust has awesome Unicode support, we respond with a nice emoji just to show off. 🕶

Lastly, we need a main function which launches Rocket and mounts our two routes. This way, they become publicly available.
If you want to know even more about the in-depth details, I may refer you to the [official Rocket documentation](https://rocket.rs/guide).

Let's check if we're on the right track by running the application.

```rust
cargo run
```

After some compiling, you should get some lovely startup output from Rocket:

```rust
🔧  Configured for development.
    => address: localhost
    => port: 8000
    => log: normal
    => workers: 8
🛰  Mounting '/':
    => GET /<hash>
🛰  Mounting '/shorten':
    => GET /shorten/<url>
🚀  Rocket has launched from http://localhost:8000...
```

Sweet! Let's call our service.

```
> curl localhost:8000/shorten/www.matthias-endler.de
💾 You shortened www.matthias-endler.de. Magnificient!

> curl localhost:8000/www.matthias-endler.de
⏩ You requested www.matthias-endler.de. Wonderful!
```

So far so good.

## Data storage and lookup

We need to keep the shortened URLs over many requests... but how?
In a production scenario, we could use some NoSQL data store like Redis for that.
Since the goal is to play with Rocket and learn some Rust, we will simply use an
in-memory store.

Rocket has a feature called [managed state](https://rocket.rs/guide/state/).

In our case, we want to manage a *repository* of URLs.

First, let's create a file named `src/repository.rs`:

```rust
use std::collections::HashMap;
use shortener::Shortener;

pub struct Repository {
    urls: HashMap<String, String>,
    shortener: Shortener,
}

impl Repository {
    pub fn new() -> Repository {
        Repository {
            urls: HashMap::new(),
            shortener: Shortener::new(),
        }
    }

    pub fn store(&mut self, url: &str) -> String {
        let id = self.shortener.next_id();
        self.urls.insert(id.to_string(), url.to_string());
        id
    }

    pub fn lookup(&self, id: &str) -> Option<&String> {
        self.urls.get(id)
    }
}
```

Within this module we first import the `HashMap` implementation from the standard library.
We also include `shortener::Shortener;`, which will help us to shorten the URLs in the next step. Don't worry too much about that for now.
By convention, we implement a `new()` method to create a new Repository struct with an empty `HashMap` and a new `Shortener`. Additionally, we have two methods, `store` and `lookup`. 

`store` takes a URL and writes it to our in-memory HashMap storage. It uses our yet to be defined shortener to create a unique id. It returns the shortened ID for the entry.
`lookup` gets a given ID from the storage and returns it as an `Option`. If the ID is found, the return value will be `Some(url)`, if there is no match it will return `None`. 

Note that we convert the string slices (`&str`) to `String` using the `to_string()` method. This way we don't need to deal with [lifetimes](https://doc.rust-lang.org/book/lifetimes.html). As a beginner, don't think too hard about them.

## Advanced remarks (can safely be skipped)

A seasoned (Rust) Programmer might do a few things differently here. Did you notice the tight coupling between the repository and the shortener? In a production system, `Repository` and `Shortener` might simply be concrete implementations of traits (which are a bit like interfaces in other languages, but more powerful). For example, `Repository` would implement `Cache` trait:

```rust
trait Cache {
    // Store an entry and return an ID
    fn store(&mut self, data: &str) -> String;
    // Look up a previously stored entry
    fn lookup(&self, id: &str) -> Option<&String>;
}
```

This way we get a clear interface, and we can easily switch to a different implementation (e.g. a `RedisCache`). Also, we could have a `MockRepository` to simplify testing. Same for `Shortener`.

You might also want to use the `Into` trait to support both, `&str` and `String` as a parameter of `store`:

```rust
pub fn store<T: Into<String>>(&mut self, url: T) -> String {
		let id = self.shortener.shorten(url);
		self.urls.insert(id.to_owned(), url.into());
		id
}
```

If you're curious about this, read [this article from Herman J. Radtke III](http://hermanradtke.com/2015/05/06/creating-a-rust-function-that-accepts-string-or-str.html).
For now, let's keep it simple.

## Actually shortening URLs

Let's implement the URL shortener itself.
You might be surprised how much was written about URL shortening [all over the web](https://blog.codinghorror.com/url-shortening-hashes-in-practice/).
One common way is to create [short urls using base 62 conversion](http://stackoverflow.com/questions/742013/how-to-code-a-url-shortener).

After looking around some more, I found this sweet crate called [harsh](https://github.com/archer884/harsh), which perfectly fits the bill.  


To use `harsh`, we add it to the dependency section of our `Cargo.toml`:

```
harsh = "0.1.2"
```

Next, we add the crate to the top of to our `main.rs`:

```
extern crate harsh;
```


Let's create a new file named `src/shortener.rs` and write the following:

```rust
use harsh::{Harsh, HarshBuilder};

pub struct Shortener {
    id: u64,
    generator: Harsh,
}

impl Shortener {
    pub fn new() -> Shortener {
        let harsh = HarshBuilder::new().init().unwrap();
        Shortener {
            id: 0,
            generator: harsh,
        }
    }

    pub fn next_id(&mut self) -> String {
        let hashed = self.generator.encode(&[self.id]).unwrap();
        self.id += 1;
        hashed
    }
}
```

With `use harsh::{Harsh, HarshBuilder};` we bring the required structs into scope. Then we define our own `Shortener` struct, which wraps `Harsh`. It has two fields: `id` stores the next id for shortening. (Since there are no negative ids, we use an [unsigned integer](https://en.wikipedia.org/wiki/Integer_(computer_science)#Value_and_representation) for that.) The other field is the `generator` itself, for which we use `Harsh`. 
Using the `HarshBuilder` you can do a lot of fancy stuff, like setting a custom alphabet for the ids. For more info, check out the [official docs](https://github.com/archer884/harsh/).
With `next_id` we retrieve a new `String` id for our URLs.

As you can see, we don't pass the URL to `next_id`. That means we actually don't shorten anything. We merely create a short, unique ID. That's because most hashing algorithms produce fairly [long URLs](https://blog.codinghorror.com/url-shortening-hashes-in-practice/) and having short URLs is the whole idea.

## Wiring it up

So we are done with our shortener and the repository.
We need to adjust our `src/main.rs` again to use the two.

This is the point where it gets a little hairy.

I have to admit that I struggled a bit here.
Mainly because I was not used to multi-threaded request handling. In Python or
PHP you don't need to think about shared-mutable access.

Initially I had the following code in my `main.rs`:

```rust
#[get("/<url>")]
fn store(repo: State<Repository>, url: &str) {
    repo.store(url);
}

fn main() {
    rocket::ignite().manage(Repository::new())
                    .mount("/store", routes![store])
                    .launch();
}
```

[State](https://rocket.rs/guide/state/) is the built-in way to save data across requests in Rocket. Just tell it what belongs to your application state with `manage()` and Rocket will automatically inject it into the routes.

But the compiler did not like that:

```rust
error: cannot borrow immutable borrowed content as mutable
  --> src/main.rs
   |
   |     repo.store(url);
   |     ^^^^ cannot borrow as mutable
```

What would happen if two requests wanted to modify our repository at the same time?
Rust prevented a race condition here!
Admittedly the error message could have been a bit more user-friendly, though.

Fortunately, Sergio Benitez helped me out on the [Rocket IRC channel](https://kiwiirc.com/client/irc.mozilla.org/#rocket) (thanks again!).
The solution was to put the repository behind a Mutex.

Here is the full `src/main.rs` in its entirety:

```rust
#![feature(plugin, custom_derive)]
#![plugin(rocket_codegen)]

extern crate rocket;
extern crate harsh;

use std::sync::RwLock;
use rocket::State;
use rocket::request::Form;
use rocket::response::Redirect;

mod repository;
mod shortener;
use repository::Repository;

#[derive(FromForm)]
struct Url {
    url: String,
}

#[get("/<id>")]
fn lookup(repo: State<RwLock<Repository>>, id: &str) -> Result<Redirect, &'static str> {
    match repo.read().unwrap().lookup(id) {
        Some(url) => Ok(Redirect::permanent(url)),
        _ => Err("Requested ID was not found.")
    }
}

#[post("/", data = "<url_form>")]
fn shorten(repo: State<RwLock<Repository>>, url_form: Form<Url>) -> Result<String, String> {
    let ref url = url_form.get().url;
    let mut repo = repo.write().unwrap();
    let id = repo.store(&url);
    Ok(id.to_string())
}

fn main() {
    rocket::ignite().manage(RwLock::new(Repository::new()))
                    .mount("/", routes![lookup, shorten])
                    .launch();
}
```

As you can see we're using a [std::sync::RwLock](https://doc.rust-lang.org/std/sync/struct.RwLock.html) here, to protect our repository from shared mutable access. This type of lock allows any number of readers or at most one writer at the same time.
It makes our code a bit harder to read because whenever we want to access our repository, we need to call the [read](https://doc.rust-lang.org/std/sync/struct.RwLock.html#method.read) and [write](https://doc.rust-lang.org/std/sync/struct.RwLock.html#method.write) methods first.

In our `lookup` method, you can see that we are returning a [Result](https://doc.rust-lang.org/std/result/enum.Result.html) type now. It has two cases: if we find an id in our repository, we return `Ok(Redirect::permanent(url))`, which will take care of the redirect. If we can't find the id, we return an `Error`.


In our `shorten` method, we switched from a `get` to a `post` request.
The advantage is, that we don't need to deal with URL encoding. We just create a struct `Url` and derive [FromForm](https://rocket.rs/guide/requests/#data) for it, which will handle the deserialization for us. Fancy!

We're done. Let's fire up the service again and try it out!

```
cargo run
```

In a new window, we can now store our first URL:

```
curl --data "url=https://www.matthias-endler.de" http://localhost:8000/
```

We get some ID back that we can use to retrieve the URL again. In my case, this was `gY`.
Point your browser to http://localhost:8000/gY.
You should be redirected to my homepage.


## Summary

Rocket provides fantastic documentation and a great community.
It really feels like an idiomatic Rustlang web framework.  

I hope you had some fun while playing with Rocket.  
You can [find the full example code on Github](https://github.com/mre/rustly).

