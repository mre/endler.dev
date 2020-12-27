+++
title="Go is Simple"
date=2020-05-29
draft=true
+++

Go is a simple language.
There is zero unneeded syntax.

Wanna create a list of things? Easy!

```go
package main

import "fmt"

func main() {
	fruits := ["mangos", "bananas", "potatoes"]
	fmt.Println(fruits)
}
```

```sh
❯❯❯ go build
./main.go:6:21: syntax error: unexpected comma, expecting ]
```

Whoops, I meant

```go
fruits := []string{"mangos", "bananas", "potatoes"}
```

```sh
❯❯❯ go build
❯❯❯
```

There you go. That special syntax makes a lot more sense.

```
❯❯❯ go run
go run: no go files listed
```

Hold on, little inconsistency here.
I got this.

```sh
❯❯❯ go run main.go
[mangos bananas potatoes]
```

There we go!

Snarky comment from the back: Potatoes are not fruits!
I did that on purpose to show off some more amazing Go:

```go
package main

import "fmt"

func main() {
	fruits := []string{"mangos", "bananas", "potatoes"}

	for fruit in fruits {
		if fruit == "potatos" {
			fmt.Println("Sweet lemony Lincoln! Potatoes are no fruits.")
		}
	}
}
```

It couldn't be any more succinct!

```sh
❯❯❯ go build
./main.go:8:12: syntax error: unexpected in, expecting {
```

Ah. Some tiny bits have to be changed. Loops are actually

```go
for i, fruit := range fruits
```

That's because you get an index and an element from `range`.
You'll get the index _just in case you need it_, which is basically... never.

```sh
❯❯❯ go build
./main.go:8:6: i declared but not used
```

Right, riiight! Go tells us when we declare a variable we don't use.
We dutifully declared `i` even though we never asked for it in the first place.
_Remember kids:_ Unused variables are bad! You don't want to litter your code with unused variables or Go will come and cling film on your loo seat.

So just do it like the rest of us and use `_` to banish that index to eternity.
We don't really talk about that okay?

```go
package main

import "fmt"

func main() {
	fruits := []string{"mangos", "bananas", "potatoes"}

	for _, fruit := range fruits {
		if fruit == "potatos" {
			fmt.Println("Sweet lemony Lincoln! Potatoes are no fruits.")
		}
	}
}
```

See? Almost like english. Could be a casual conversation between the two of us.
It's execution time, baby!

```go
❯❯❯ go run main.go
❯❯❯
```

No output. Whoopsie.
Little spelling mistake there.
Ha, I didn't go to university for nothing. Of course I know how "potatoes" is spelled.
String comparisons are so 1990. Way too easy to mess that stuff up.
We're smarter than that by leveraging the superpowers of the Golang type system. 🦹‍♀️

## Constants!

No way you can missspell strings anymore with the wizardry that is constants!

```go
package main

import "fmt"

const mangos = "mangos"
const bananas = "bananas"
const potatoes= "potatoes"

func main() {
	fruits := []string{mangos, bananas, potatoes}

	for _, fruit := range fruits {
		if fruit == potatoes {
			fmt.Println("Sweet lemony Lincoln! Potatoes are no fruits.")
		}
	}
}
```

```sh
❯❯❯ go run main.go
Sweet lemony Lincoln! Potatoes are no fruits.
```

Now we're talkin'.  
It's just that easy.

Of course that's all fun and silly but not really useful.
Why use constants when you can use enums?

# Enums!

I mean, we don't really have enums in Go.
But we don't need them either because we can simply slap a few constants together and _pretend_ it's an enum.
Say you wanted to represent the state of a device that could either be "activated" or "idle". Just do something like

```go
type Device int

const (
	Activated = 0
	Idle      = 1
)
```

You have a teensy upfront cost because you have to enumerate the states yourself;
but behold, we don't need enums. They are just unnecessary complexity.
A mental burden that other, weaker languages carry around.
It gets in the way of simplicity.

Let's say we constantly check the state of a device and do something if the state changes.

```go
package main

import "fmt"

type Device int

const (
	Activated = 0
	Idle      = 1
)

func main() {
	var rocket Device

	for {
		switch rocket {
		case Activated:
			fmt.Println("Lord have mercy")
		case Idle:
			fmt.Println("All good")
		}
	}
}
```

See? That pattern feels very natural in Go.

This won't compile of course because there's another bug.
Can you spot it?
That's right, we never really initialized `rocket`. 😅
Running the program in that state could cause havoc.

The sophisticated Go type system prevented us from...

```sh
❯❯❯ go run main.go
Lord have mercy
Lord have mercy
Lord have mercy
Lord have mercy
Lord have mercy
Lord have mercy
```

Oh no.

Looks like `rocket` got initialized to its zero-value of int, which is... 0 and therefore `Activated`. 😬💀

Ah, that was just a toy example anyway.
In 99% of the cases, you don't **need** enums so it's better to omit that keyword in the first place.

Here's something real that I have to do from time to time:

## Finding the unique elements in a slice

```go
import "fmt"

func contains(l []int, e int) bool {
	for _, a := range l {
		if a == e {
			return true
		}
	}
	return false
}

func main() {
	list := []int{5, 1, 2, 1, 3, 4, 1, 5}
	var unique []int

	for _, i := range list {
		if contains(unique, i) {
			continue
		} else {
			unique = append(unique, i)
		}
	}
	fmt.Println(unique)
}
```

Super simple code. Straightforward, trivial to write.
It just works... for small inputs.
Well technically the runtime grows quadratically by the number of elements, but
we can easily fix that. It's quite simple really: we store the elements in a
datastructure that allows for fast access.

Enter HashSets.

Now Golang has no HashSets, but it's trivial to implement them with a map.
First put everything into a `map[int]bool`:

```go
list := []int{5, 1, 2, 1, 3, 4, 1, 5}
lookup := map[int]bool{}

for _, i := range list {
    if _, ok := lookup[i]; !ok {
        lookup[i] = true
    }
}
```

Then convert the map back to a slice

```go
var unique []int
for k := range lookup {
    unique = append(unique, k)
}
```

Trivial!

In Python that pesky `set` keyword vomits all over the global namespace.

```python
print(set([5, 1, 2, 1, 3, 4, 1, 5]))
```

Nah! We don't want any of that in Go world.
Better save those keywords to keep the language simple to understand and easy to learn.

After all, [Antoine de Saint Exupéry](https://en.wikiquote.org/wiki/Antoine_de_Saint_Exup%C3%A9ry) said it best

> It seems that perfection is attained, not when there is nothing more to add, but when there is nothing more to take away.

```python
languages = set(["dart", "go", "python"])
board_games = set(["chess", "monoploy", "go"])
google_search_nightmares = languages.intersection(board_games)
print(google_search_nightmares)
```

Oh shut up Python! You share your name with an animal; that won't make searching any easier.
Oh, it's about the `intersection()` method? Yeah we can totally add that, too in Go.
We just have to write a few more lines of code.
And while we're add it we can add `union()` and `member()` and `difference()`, too!
Golang is the only mainstream language that teaches you how to implement basic datastructures yourself.

Wait a sec. Nobody does that in real life. That's what libraries are for!




