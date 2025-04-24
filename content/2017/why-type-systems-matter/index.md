+++
title="Why Type Systems Matter"
date=2017-07-10
[taxonomies]
tags=["culture", "dev", "rust"]

[extra]
social_img="2017_why_type_systems_matter.png"
comments = [
  {name = "Hacker News", url = "https://news.ycombinator.com/item?id=15046896"},
  {name = "Reddit", url = "https://www.reddit.com/r/rust/comments/6mknzp/why_type_systems_matter/"}
]
+++

I've written most of my code in dynamically typed languages such as Python or PHP; but ever since dabbling with [Rust](https://www.rust-lang.org), I've developed a passion for static type systems.  
It began to feel very natural to me; like a totally new way to express myself.

<!-- more -->

## Types are here to help

With types, you communicate your guarantees and expectations. Both, to the machine and other developers. Types express intent.

As a programmer, you've probably gained some _intuition_ about types.

```python
sentence = "hello world"
```

You might guess that `sentence` is a string. It's in quotes, after all.
It gets a little more tricky if the type gets _inferred_ from some other location.

```python
sentence = x
```

Is `sentence` still a string? Uhm... we don't know. It depends on the type of `x`. Maybe `x` is a number, and so `sentence` is also a number? Maybe `x`used to be a string but during refactoring it is now a byte array? Fun times had by all. 🎉

What about this one?

```python
filesize = "5000" # Size in bytes
```

Here, we express a file size as a string.

While this might work, it's an unsettling idea.  
Even simple calculations might lead to unexpected results:

```python
file1 = "5000"
file2 = "3000"
total = file1 + file2
print(total) # prints '50003000'
```

## How can we fix that?

We can safely assume that a file size is always a number.
To be more precise, it must be a positive, natural number.
There can be no negative file size, and our smallest block of memory is one byte
(on all but the most [obscure systems](https://en.wikipedia.org/wiki/4-bit)).
And since we're dealing with a discrete machine here, we know it can only be
a filesize the computer can handle.
If we only could express all of this in a precise way...?

This is where type systems enter the stage.  
In Rust, you could define a `File` type with a field named `size`.

```rust
struct File {
  name: String,
  size: usize,
}
```

The `usize` gives you the guarantee to be always big enough to hold any pointer into memory (on 64 bit computers [`usize = u64`](https://stackoverflow.com/a/29592369/270334)).
Now there is no more ambiguity about the type of `size`.
You can't even create an invalid file object:

```rust
// Error: `size` can't be a string.
let weird_file = File { name: 123, size: "hello" };
```

The type system will prevent invalid state. It will simply not allow you to
break your own rules. It will hold you accountable for your design choices.
Dare I say it: it becomes an extension of your brain.
After some time you start to rely on the type checker. "If it compiles, it runs"
is a powerful mantra.

## Types improve readability and provide context

Consider the following Python snippet:

```python
def filter_files(files):
  matches = []
  for file in files:
    if file.status == 0:
      matches.append(file)
  return matches
```

What does `0` represent?
We can't say. We lack the context!

The story gets a little clearer once we define an [enum](https://docs.python.org/3/library/enum.html) type like this:

```python
from enum import Enum

class FileStatus(Enum):
  OPEN = 0
  CLOSED = 1
```

Our example from above becomes

```python
def filter_files(files):
  matches = []
  for file in files:
    if file.status == FileStatus.OPEN:
      matches.append(file)
  return matches
```

In a larger codebase, `FileStatus.OPEN` is much easier to search for than `0`.

**Note:** The native enum type was [introduced very late in the history of Python](https://www.python.org/dev/peps/pep-0435/). It serves as a nice
example of how enhancing the type system can help improve readability.

## When you combine different types, magic happens.

All pieces suddenly fall into place when you choose your types wisely. Out of nowhere, the compiler will start
checking your design decisions and if all your types work well together. It will point out flaws in your mental model.
This gives you a great amount of confidence during refactoring.

For example, let's think about sorting things.
When I think of sorting, I first think about a list of numbers:

```python
sorted([1,5,4,3,2]) # [1,2,3,4,5]
```

That's the happy path. How about this one?

```python
sorted(1)
```

Ouch. This can't work because `1` is a single number and not a collection!
If we forget to check the type before we pass it to `sorted`, we get an error
while the program runs.

```python
sorted([1, "fish"])
```

In Python 2, this would result in `[1, 'fish']` (<strike>because strings will be compared by length</strike>)

Edit: Reddit user [jcdyer3 pointed out](https://www.reddit.com/r/rust/comments/6mknzp/why_type_systems_matter/dk2jtcm/) that the reason is that when incomparable types are compared, they sort by their type, so all ints will come before all strings. It's a [CPython implementation detail](https://stackoverflow.com/a/3270689/270334)).

{{ figure(src="fish.svg", caption="1 < fish according to Python 2",
credits="Illustration provided by [Freepik](https://www.freepik.com/free-vector/sealife-animals-collection_1072064.htm)") }}

Since Python 3, this throws an Exception.

```python
TypeError: '<' not supported between instances of 'str' and 'int'
```

Much better! One less source of error. The problematic thing is though, that this happens at runtime.
That's because of Python's dynamic typing.
We could have avoided that with a statically typed language.

```rust
fn sorted<T>(collection: &mut [T]) where T: PartialOrd {
  // TODO: Sort the collection here.
}
```

Looks scary but it really isn't.

We define a function named `sorted` which takes one input parameter named
`collection`.

The type of `collection` consists of four parts:

1. The `&` means that we "borrow" the collection, we don't own it. After the function returns, it will still exist. It won't be cleaned up.
2. The `mut` means that the collection is mutable. We are allowed to modify it.
3. `[T]` indicates that we expect a list/slice/vector as input. Everything else
   will be rejected at compile time (before the program even runs).
4. [`PartialOrd`](https://doc.rust-lang.org/std/cmp/trait.PartialOrd.html) is
   the magic sauce. It is a [trait](https://doc.rust-lang.org/book/second-edition/ch10-02-traits.html), which is something like an interface. It means that all elements `T` in the collection must be [partially ordered](https://en.wikipedia.org/wiki/Partially_ordered_set).

All of this information helps the compiler to prevent us from shooting ourselves in the foot.
And we can understand the inputs and outputs of the function without looking elsewhere.

## Takeaways

- Types force developers to do their homework and think about the guarantees and limitations of their code.
- Don't think of types as constraints, think of them as a safety net which will protect you from your own flawed mental models.
- Always choose the type which most precisely expresses your intent.
- If there is no perfect type in the standard library, create your own from simpler types.

Following these rules, I found that I was magically guided towards the most elegant representation of my ideas.
My code became much more idiomatic.
