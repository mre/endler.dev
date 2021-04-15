+++
title="Go is not Simple"
date=2020-05-29
draft=true
[taxonomies]
tags=["go", "dev"]
+++

When Go was first released, I was a university student
and I started looking into it on day 1.
Started doing the tour of Go and for some reason I
didn't like it but I couldn't point my finger at why.
Ten years later I have a much clearer picture.

The gist is that Go is not simple.
There are instead many inconsistencies and dogmas that
lead to a lot of unnecessary complexity.

This post turned out to be quite long.

Some people have talked about Go in relation to "environmental complexity" already.
Memory, CPUs, File systems,...
https://fasterthanli.me/blog/2020/i-want-off-mr-golangs-wild-ride/
And I think that's a bit unfair. Systems are complex unfortunately.
It's not Go's fault.

Oh the joys of writing Go!

Consider the following Go code

```go
files := ["foo", "bar", "baz"]
```

oh I mean

```go
files := [...]string{"foo", "bar", "baz"}
```

I can never remember how to create an array.

```go
files := []string{"main.js", "bundle.json", "utils"}
for _, file := range files {
    if _, err := os.Stat(file); err != nil {
        exit(err.Error(), 1)
    }
}
```

Now we want to compress those files

```go
cmd = exec.Command("tar", files...)
```

Nice. Whoops, forgot some params

```go
cmd = exec.Command("tar", "-czvf", "deploy.tar.gz", files...)
```

Invalid...
Only last parameter can be expanded.
I ended up with something like that:

```go
params := []string{"-czvf", "deploy.tar.gz"}
params = append(params, files...)
cmd = exec.Command("tar", params...)
if stdout, err := cmd.CombinedOutput(); err != nil {
    exit(err.Error()+string(stdout), 1)
}
```

Could also use builtin compression, but

fmt.Println("%d", 1)
fmt.Println("%s", "bla")

Why do I have to remember the data type?
Shouldn't everything that is printable just...work?

Golang is riddled with such footguns.

...or "Rust is hard"?

You just need some discipline!

Channels! Channels are simple, right?
Big thing in Go.
Channels "ok" example (see code in main.go)

Nobody said Go is elegant.
That's not the problem.
Go is easy, lazy, pragmatic.
Insisting that Go is simple is hurting it.

It's one big tradeoff

Simple vs easy diagram, Rick Hickey, Clojure fame
https://www.infoq.com/presentations/Simple-Made-Easy/

Lego is simple.
You can use the same basic building blocks over and over for radically different projects.

Go is not.
syntactically maybe, but not semantically
There are very few building blocks but they are not composable.
Example: iteration is special for built-in types
https://stackoverflow.com/questions/35810674/in-go-is-it-possible-to-iterate-over-a-custom-type/35810932
Iterating over custom objects is not possible
No, not using range. range accepts arrays, slices, strings, maps, and channels, and that's it.

Another example:
different syntax for initializing basic datatypes
var foo = 42
foo := 42
It's inconsistent and hence complex
In Rust you have only one way
this reaches deep into the Go core and the standard library.
system complexity leaks right through those easy abstractions
it's contagious, poisonous
affects your own code

It can even be dangerous or misleading

```go
var nilSlice []string
fmt.Println(nilSlice)        // Output: []
fmt.Println(nilSlice == nil) // Output: true

emptySlice := make([]string, 1)
fmt.Println(emptySlice)        // Output: []
fmt.Println(emptySlice == nil) // Output: false

// fmt.Println(emptySlice == nilSlice) // Slice can only be compared to nil
```

Inconsistency in internal datatypes

```go
package main

import (
	"fmt"
)

func main() {
	// reading from a nil map returns zero values...
	var nilMap map[int]string
	fmt.Println(nilMap[0])

	// ...but reading from a nil slice panics
	var nilSlice []string
	fmt.Println(nilSlice[0])
}
```

Inconsistencies even in nil

Golang FAQ: Why is my nil error value not equal to nil?
https://golang.org/doc/faq#nil_error

Another example for "easy" abstractions: switch-case and enums.

No enums
You can forget cases
You end up with brittle, stringy typed or integer typed code.

Variables (mutable) by default
In Rust: immutability
functions and methods have special notations for `mut`. It's immediately clear
that a function changes a parameter.
leads to simple reasoning

legwork because of missing language constructs
e.g. checking for nil, empty string, 0,...

Rust is especially difficult if you bring your C-like assumptions to it.
program[0]="+"; | ^^^^^^^^^^ the type `str` cannot be mutably indexed by `{integer}`
https://news.ycombinator.com/item?id=16202031

> For every complex problem there is an answer that is clear, simple, and wrong.
> (Adapted from https://en.wikiquote.org/wiki/H._L._Mencken)

Go is simple by offloading the cost of complexity to its users.

Classic: “There are only two kinds of languages: the ones people complain about and the ones nobody uses.”[1]
https://www.goodreads.com/quotes/226225-there-are-only-two-kinds-of-languages-the-ones-people

"Rob Pike Simplicity is complicated - Production ready HTTP server"
https://youtu.be/rFejpH_tAHM?t=1335

Nah, Rob. There's more to it.
https://blog.cloudflare.com/exposing-go-on-the-internet/

https://rust-lang-nursery.github.io/rust-cookbook/net/server.html

Sum types (Result and Option)
https://news.ycombinator.com/item?id=22443567

HTTP client
leaking when forgetting defer
not handling errors on defer
no warning when forgetting to handle an error

---

> Over and over, Go is a victim of its own mantra - “simplicity”. (...)

> It constantly lies about how complicated real-world systems are, and optimize for the 90% case, ignoring correctness.

> This fake “simplicity” runs deep in the Go ecosystem.

Wrong in subtle ways
Silently wrong

Go's handling of errors is often ridiculed for its verbosity and lack of thought, but the fact that Go makes it so easy to sweep errors under the rug has real and devastating consequences in the real world.

Example: Using strings as paths

OSstring vs string vs &str

Go was never design for that
I just don't like that it's advertised as simple
can lead to frustration

I think the mistake may be assuming that Go is meant to be a general-purpose language. From what I can tell, it's purpose-built to be a "web services" language, and its design-decisions center around that. What does that mean?

What I don't like is the attitude of the core devs
They feel enlightened
Same vibe I got from the C programming language
The examples in the book work because they are wrong
Go is the modern C

Leads to bugs and people using Go for projects it was never designed for like Docker.

The Go standard libary

"batteries included"
a terrible builtin json library,
why is that in in the first place?
because pragmatism?
what about toml?

go build ... multiple files? how? Always have to look it up

False Assumptions

It's a pretty good article. The tl;dr is that golang is a POSIX-focused application programming language that is incorrectly advertised as a platform-agnostic systems programming language.
Go is often misunderstood

- server-side
- networking
- unix/linux
- inside the Google team
- microservices

If thoes assumptions hold, Go is the way to go.
Things start becoming interesting when one or more assumptions are incorrect.
Writing 100kloc projects in Go will make you miss generics

I have a love-hate relationship with Go.
You get so much done so quickly.
With all its bugs it's surprising how often it actually runs.

Comparing Go to Rust is the wrong approach
The languages are fundamentally different
Go/Rust evangelism strikeforce

http://devs.cloudimmunity.com/gotchas-and-common-mistakes-in-go-golang/

I'm just from a different school of thought.

imposing a disproportionate cost on users.o

inconsistenjt

    repo := &github.Repository{
    	Name:       github.String("migrate-test"),
    	Visibility: github.String("internal"),
    	Topics:     []string{"inner-source"},
    }

repo declared but not used
okay use underscore

    _repo := &github.Repository{
    	Name:       github.String("migrate-test"),
    	Visibility: github.String("internal"),
    	Topics:     []string{"inner-source"},
    }

not enough
need `_` but then I have to remember the name for later...
on the other side, errors are hidden when they were used "once"

response, err := bla()
response, err := bar() // no new variables

Sometimes yo don't have a better name for a variable...
Have to change to `=`
Especially annoying during debugging
Why can't I use `:=` in general?

Subtle errors example: environment variables

```go
token := os.Getenv("HOME")
```

token can be empty...
can lead to dangerous situations
(rm -rf / instead of rm -rf /\${HOME})

```rust
use std::env;

let key = "HOME";
match env::var(key) {
    Ok(val) => println!("{}: {:?}", key, val),
    Err(e) => println!("couldn't interpret {}: {}", key, e),
}
```

https://doc.rust-lang.org/std/env/fn.var.html

It's a bit like shell-scripting in that regard: incredibly powerful and productive
when it works, extremely dangerous when it doesn't.
Pick your poison.

chaining commands is tricky without sum types

```go
cmd := exec.Command("akamai", "edgeworkers", "list-ids", "--section", "edgeworkers", "json", "output.json")
stdout, err := cmd.CombinedOutput()
if err != nil {
    exit(err.Error()+string(stdout), 1)
}

b, err := ioutil.ReadFile("output.json") // just pass the file name
if err != nil {
    fmt.Print(err)
}

var res AkamaiListID
err := json.Unmarshal([]byte(str), &res)
```

wrong
found := nil

right
var found \*Foo

Constantly feel like pushing water uphill with a rake
repetitive, boring

Concurrency

- Mutex is separate from value
  In Rust it's part of it.

Typeclasses carry value with them

The lazyness is also part of the build system
`go build` and `go run` behave differently...

```go
❯❯❯ go build

content/2020/go-is-not-simple on  master
❯❯❯ go run                                                                                                                ✘ 130
go run: no go files listed

content/2020/go-is-not-simple on  master
❯❯❯ go run main.go                                                                                                          ✘ 1
ping
```

There might be good reasons for that, but I don't want to care

http://devs.cloudimmunity.com/gotchas-and-common-mistakes-in-go-golang/

Golang has very little syntax
A common fallacy is that more things lead to complexity.
Actually the opposite can be the case: simplicity often means having more things, not fewer.

> Simplicity is not about counting
> I'd rather have more things hanging nice straight down not twisted together
> than just a couple of things tied in a knot.
> Rich Hickey
> I recommend you watch the whole talk as it's pure gold.

The Go tooling is often praised as one of the best parts of the language.
I think it was great for its time but it has not aged well.
godoc: plain list of functions and no explanation and linking.
https://youtu.be/RP6YE6ZlX2M
no search

gofmt: removes unused imports on save

99% of the time you don't need it
but every program needs the 1%
HashSet
Enum
unsafe.Pointer

shutdown handler
open connections / files
finish serving clients
people learn from that

// https://blog.learngoprogramming.com/golang-const-type-enums-iota-bc4befd096d3

````
type Activity intconst (
    Sleeping = iota
    Walking
    Running
)func main() {
    var activity Activity
    // activity initialized to
    // its zero-value of int
    // which is Sleeping
}```


Wait a sec, where did I hear that one before...!?

## Right, C.
````
