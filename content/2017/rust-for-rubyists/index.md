+++
title="Rust for Rubyists"
date=2017-12-17

[extra]
subtitle="Idiomatic Patterns in Rust and Ruby"
css=true
comments = [
  {name = "Reddit", url = "https://www.reddit.com/r/programming/comments/7kefgh/rust_for_rubyists/"},
  {name = "Hacker News", url = "https://news.ycombinator.com/item?id=15986838#16003994"}
]
+++


Recently I came across a delightful article on idiomatic Ruby.
I'm not a good Ruby developer by any means, but I realized, that a lot of the patterns are also quite common in Rust.
What follows is a side-by-side comparison of idiomatic code in both languages.

The Ruby code samples are from the [original article](https://medium.com/the-renaissance-developer/idiomatic-ruby-1b5fa1445098).

## Map and Higher-Order Functions

The first example is a pretty basic iteration over elements of a container using `map`.

<a class="example" href="https://gist.github.com/LeandroTk/64ca7d6f5279e08589e21d799544e878#file-map-rb">
<div class="ruby lang-icon"></div>

```ruby
user_ids = users.map { |user| user.id }
```
</a>

The `map` concept is also pretty standard in Rust.
Compared to Ruby, we need to be a little more explicit here:
If `users` is a vector of `User` objects, we first need to create an iterator from it:

<a class="example" href="https://play.rust-lang.org/?gist=5a61b7b44ff01fabbc07dba9409d9b97&version=stable">
<div class="rust lang-icon"></div>

```rust
let user_ids = users.iter().map(|user| user.id);
```
</a>

You might say that's quite verbose, but this additional abstraction allows us to express an important concept:
will the iterator take ownership of the vector, or will it not?

* With `iter()`, you get a "read-only view" into the vector. After the iteration, it will be unchanged.
* With `into_iter()`, you take ownership over the vector. After the iteration, the vector will be gone.
  In Rust terminology, it will have *moved*.
* Read some more about the [difference between `iter()` and `into_iter()` here](http://hermanradtke.com/2015/06/22/effectively-using-iterators-in-rust.html).


The above Ruby code can be simplified like this:

<a class="example" href="https://gist.github.com/LeandroTk/258652cbaea308ccfeddc5df5bb9f37b#file-each_vs_map_3-rb">
<div class="ruby lang-icon"></div>

```ruby
user_ids = users.map(&:id)
```

</a>

In Ruby, higher-order functions (like `map`) take [blocks or procs](http://awaxman11.github.io/blog/2013/08/05/what-is-the-difference-between-a-block/) as an argument and the language provides a convenient shortcut for method invocation &mdash; `&:id` is the same as `{|o| o.id()}`.

Something similar could be done in Rust:

<a class="example" href="https://play.rust-lang.org/?gist=131027a481d4691821315ad308d26dc9&version=stable">
<div class="rust lang-icon"></div>

```rust
let id = |u: &User| u.id;
let user_ids = users.iter().map(id);
```

</a>

This is probably not the most idiomatic way to do it, though. What you will see more often is the use of [Universal Function Call Syntax](https://doc.rust-lang.org/book/first-edition/ufcs.html) in this case:<sup><a href="#fn1" id="ref1">1</a></sup>

<a class="example" href="https://play.rust-lang.org/?gist=51069ee76e5d534621ccd6633474b630&version=stable">
<div class="rust lang-icon"></div>

```rust
let user_ids = users.iter().map(User::id);
```

</a>



In Rust, higher-order functions take **functions** as an argument. Therefore `users.iter().map(Users::id)` is more or less equivalent to `users.iter().map(|u| u.id())`.<sup><a href="#fn2" id="ref2">2</a></sup>

Also, `map()` in Rust returns another iterator and not a collection.
If you want a collection, you would have to run [`collect()`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#examples-23) on that, as we'll see later.

## Iteration with Each

Speaking of iteration, one pattern that I see a lot in Ruby code is this:

<a class="example" href="https://gist.github.com/mre/f6552360a4c08f2c064da7f00d434d5c">
<div class="ruby lang-icon"></div>

```ruby
["Ruby", "Rust", "Python", "Cobol"].each do |lang|
  puts "Hello #{lang}!"
end
```

</a>

Since [Rust 1.21](https://blog.rust-lang.org/2017/10/12/Rust-1.21.html), this is now also possible:

<a class="example" href="https://play.rust-lang.org/?gist=549d38bc43549fd5444c731d2bc3a47b&version=stable">
<div class="rust lang-icon"></div>

```rust
["Ruby", "Rust", "Python", "Cobol"]
    .iter()
    .for_each(|lang| println!("Hello {lang}!", lang = lang));
```

</a>



Although, more commonly one would write that as a normal for-loop in Rust:

<a class="example" href="https://play.rust-lang.org/?gist=a7691b56b1dfd1fb19aa00a91b39589d&version=stable">
<div class="rust lang-icon"></div>

```rust
for lang in ["Ruby", "Rust", "Python", "Cobol"].iter() {
    println!("Hello {lang}!", lang = lang);
}
```

</a>

## Select and filter

Let's say you want to extract only even numbers from a collection in Ruby.

<a class="example" href="https://gist.github.com/LeandroTk/f341051889e27c99ddd66c075e5ef6d0#file-map_vs_select_1-rb">
<div class="ruby lang-icon"></div>

```ruby
even_numbers = [1, 2, 3, 4, 5].map { |element| element if element.even? } # [ni, 2, nil, 4, nil]
even_numbers = even_numbers.compact # [2, 4]
```
</a>

In this example, before calling `compact`, our `even_numbers` array had `nil` entries.
Well, in Rust there is no concept of `nil` or `Null`. You don't need a `compact`.
Also, `map` doesn't take predicates. You would use `filter` for that:

<a class="example" href="https://play.rust-lang.org/?gist=494d6e3ff016c21931e3495b10c8f6ee&version=stable">
<div class="rust lang-icon"></div>

```rust
let even_numbers = vec![1, 2, 3, 4, 5]
    .iter()
    .filter(|&element| element % 2 == 0);
```
</a>

or, to make a vector out of the result

<a class="example" href="https://play.rust-lang.org/?gist=45c6dbd2d35316c73165c5571d66df9d&version=stable">
<div class="rust lang-icon"></div>

```rust
// Result: [2, 4]
let even_numbers: Vec<i64> = vec![1, 2, 3, 4, 5]
    .into_iter()
    .filter(|element| element % 2 == 0).collect();
```
</a>

Some hints:

* I'm using the type hint `Vec<i64>` here because, without it, Rust does not know what collection I want to build when calling `collect`.
* `vec!` is a macro for creating a vector.
* Instead of `iter`, I use `into_iter`. This way, I take ownership of the elements in the vector. With `iter()` I would get a `Vec<&i64>` instead.

In Rust, there is no `even` method on numbers, but that doesn't keep us from defining one!

<a class="example" href="https://play.rust-lang.org/?gist=c289c2a1cf8bd870cbd5cc2cd60ea791&version=stable">
<div class="rust lang-icon"></div>

```rust
let even = |x: &i64| x % 2 == 0;
let even_numbers = vec![1, 2, 3, 4, 5].into_iter().filter(even);
```
</a>

In a real-world scenario, you would probably use a third-party package (crate) like [`num`](https://github.com/rust-num/num) for numerical mathematics:

<a class="example" href="https://play.rust-lang.org/?gist=e4bbbf60b7b1cbbedfb363672731bf53&version=stable">
<div class="rust lang-icon"></div>

```rust
extern crate num;
use num::Integer;

fn main() {
    let even_numbers: Vec<i64> = vec![1, 2, 3, 4, 5]
        .into_iter()
        .filter(|x| x.is_even()).collect();
}
```
</a>

In general, it's quite common to use crates in Rust for functionality that is not in the standard lib.
Part of the reason why this is so well accepted is that [cargo](https://github.com/rust-lang/cargo) is such a rad package manager.
(Maybe because it was built by no other than [Yehuda Katz](http://yehudakatz.com/about/) of Ruby fame. 😉)

As mentioned before, Rust does not have `nil`. However, there is still the concept of operations that can fail.
The canonical type to express that is called [`Result`](https://doc.rust-lang.org/std/result/).

Let's say you want to convert a vector of strings to integers.

<a class="example" href="https://play.rust-lang.org/?gist=1365d177503ee2d32c4aa594263ee4d4&version=stable">
<div class="rust lang-icon"></div>

```rust
let maybe_numbers = vec!["1", "2", "nah", "nope", "3"];
let numbers: Vec<_> = maybe_numbers
    .into_iter()
    .map(|i| i.parse::<u64>())
    .collect();
```
</a>

That looks nice, but maybe the output is a little unexpected. `numbers` will also contain the parsing errors:

<a class="example" href="https://play.rust-lang.org/?gist=1365d177503ee2d32c4aa594263ee4d4&version=stable">
<div class="rust lang-icon"></div>

```rust
[Ok(1), Ok(2), Err(ParseIntError { kind: InvalidDigit }), Err(ParseIntError { kind: InvalidDigit }), Ok(3)]
```
</a>

Sometimes you're just interested in the successful operations.
An easy way to filter out the errors is to use [`filter_map`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.filter_map):

<a class="example" href="https://play.rust-lang.org/?gist=afdc823ec2e165ac0a03948fb323d305&version=stable">
<div class="rust lang-icon"></div>

```rust
let maybe_numbers = vec!["1", "2", "nah", "nope", "3"];
let numbers: Vec<_> = maybe_numbers
    .into_iter()
    .filter_map(|i| i.parse::<u64>().ok())
    .collect();
```
</a>

I changed two things here:

* Instead of `map`, I'm now using `filter_map`.
* `parse` returns a `Result`, but `filter_map` expects an `Option`. We can convert a `Result` into an `Option` by calling `ok()` on it<sup><a href="#fn3" id="ref3">3</a></sup>.

The return value contains all successfully converted strings:

<a class="example" href="https://play.rust-lang.org/?gist=afdc823ec2e165ac0a03948fb323d305&version=stable">
<div class="rust lang-icon"></div>

```rust
[1, 2, 3]
```
</a>

The `filter_map` is similar to the `select` method in Ruby:

<a class="example" href="https://gist.github.com/LeandroTk/1ae24e0fece0207f814932b0ac6c4a5e#file-map_vs_select_2-rb">
<div class="ruby lang-icon"></div>

```ruby
[1, 2, 3, 4, 5].select { |element| element.even? }
```
</a>


## Random numbers


Here's how to get a random number from an array in Ruby:

<a class="example" href="https://play.rust-lang.org/?gist=a66785b44094bacb78fa8dd822bfeab5&version=stable">
<div class="ruby lang-icon"></div>

```ruby
[1, 2, 3].sample
```
</a>

That's quite nice and idiomatic!
Compare that to Rust:

<a class="example" href="https://play.rust-lang.org/?gist=bed7fca31737bcbf4b9aed427cc22713&version=stable">
<div class="rust lang-icon"></div>

```rust
let mut rng = thread_rng();
rng.choose(&[1, 2, 3, 4, 5])
```
</a>

For the code to work, you need the `rand` crate. Click on the snippet for a running example.

There are some differences to Ruby. Namely, we need to be more explicit about what random number generator
we want *exactly*. We decide for a [lazily-initialized thread-local random number generator, seeded by the system](https://docs.rs/rand/0.6.1/rand/fn.thread_rng.html).
In this case, I'm using a [slice](https://doc.rust-lang.org/std/slice/) instead of a vector. The main difference is that the slice has a fixed size while the vector does not.

Within the standard library, Rust doesn't have a `sample` or `choose` method on the slice itself. 
That's a design decision: the core of the language is kept small to allow evolving the language in the future.

This doesn't mean that you cannot have a nicer implementation today.
For instance, you could define a `Choose` [trait](https://doc.rust-lang.org/book/second-edition/ch10-00-generics.html) and implement it for `[T]`.


<a class="example" href="https://play.rust-lang.org/?gist=a66785b44094bacb78fa8dd822bfeab5&version=stable">
<div class="rust lang-icon"></div>

```rust
extern crate rand;
use rand::{thread_rng, Rng};

trait Choose<T> {
    fn choose(&self) -> Option<&T>;
}

impl<T> Choose<T> for [T] {
    fn choose(&self) -> Option<&T> {
        let mut rng = thread_rng();
        rng.choose(&self)
    }
}
```
</a>

This boilerplate could be put into a crate to make it reusable for others.
With that, we arrive at a solution that rivals Ruby's elegance.

<a class="example" href="https://play.rust-lang.org/?gist=a66785b44094bacb78fa8dd822bfeab5&version=stable">
<div class="rust lang-icon"></div>

```rust
[1, 2, 4, 8, 16, 32].choose()
```
</a>

## Implicit returns and expressions

Ruby methods automatically return the result of the last statement.

<a class="example" href="https://gist.github.com/LeandroTk/9ede60f0898979f8f74d2869ed014c0c#file-return_2-rb">
<div class="ruby lang-icon"></div>

```ruby
def get_user_ids(users)
  users.map(&:id)
end
```
</a>

Same for Rust. Note the missing semicolon.

<a class="example" href="https://play.rust-lang.org/?gist=c7130debb2f712269380bd04819069ff&version=stable">
<div class="rust lang-icon"></div>

```rust
fn get_user_ids(users: &[User]) -> Vec<u64> {
    users.iter().map(|user| user.id).collect()
}
```
</a>

But in Rust, this is just the beginning, because *everything* is an expression.
The following block splits a string into characters, removes the `h`, and returns the result as a `HashSet`.
This `HashSet` will be assigned to `x`.

<a class="example" href="https://play.rust-lang.org/?gist=9ad54a58d3e5f1c06e795b5f7dca451e&version=stable">
<div class="rust lang-icon"></div>

```rust
let x: HashSet<_> = {
    // Get unique chars of a word {'h', 'e', 'l', 'o'}
    let unique = "hello".chars();
    // filter out the 'h'
    unique.filter(|&char| char != 'h').collect()
};
```
</a>

Same works for conditions:

<a class="example" href="https://play.rust-lang.org/?gist=cec96176079e8812ff62ad84a432ac9d&version=stable">
<div class="rust lang-icon"></div>

```rust
let x = if 1 > 0 { "absolutely!" } else { "no seriously" };
```
</a>

Since a [`match`](https://doc.rust-lang.org/1.2.0/book/match.html) statement is also an expression, you can assign the result to a variable, too!

<a class="example" href="https://play.rust-lang.org/?gist=a6b32fae6257787432cf607f5772693e&version=stable">
<div class="rust lang-icon"></div>

```rust
enum Unit {
    Meter,
    Yard,
    Angstroem,
    Lightyear,
}

let length_in_meters = match unit {
    Unit::Meter => 1.0,
    Unit::Yard => 0.91,
    Unit::Angstroem => 0.0000000001,
    Unit::Lightyear => 9.461e+15,
};
```
</a>

## Multiple Assignments

In Ruby you can assign multiple values to variables in one step:

<a class="example" href="https://gist.github.com/LeandroTk/998bed8f8c20e487a1b8a638dd7563a1#file-multiple_assignment_1-rb">
<div class="ruby lang-icon"></div>

```ruby
def values
  [1, 2, 3]
end

one, two, three = values
```
</a>

In Rust, you can only decompose tuples into tuples, but not a vector into a tuple for example.
So this will work:

<a class="example" href="https://play.rust-lang.org/?gist=11b02c318ec35456b8247c3161cb341b&version=nightly">
<div class="rust lang-icon"></div>

```rust
let (one, two, three) = (1, 2, 3);
```
</a>

But this won't:

<a class="example" href="https://play.rust-lang.org/?gist=11b02c318ec35456b8247c3161cb341b&version=nightly">
<div class="rust lang-icon"></div>

```rust
let (one, two, three) = [1, 2, 3];
//    ^^^^^^^^^^^^^^^^^ expected array of 3 elements, found tuple
```
</a>

Neither will this:

<a class="example" href="https://play.rust-lang.org/?gist=11b02c318ec35456b8247c3161cb341b&version=nightly">
<div class="rust lang-icon"></div>

```rust
let (one, two, three) = [1, 2, 3].iter().collect();
// a collection of type `(_, _, _)` cannot be built from an iterator over elements of type `&{integer}`
```
</a>

But with nightly Rust, you can now do this:

<a class="example" href="https://play.rust-lang.org/?gist=11b02c318ec35456b8247c3161cb341b&version=nightly">
<div class="rust lang-icon"></div>

```rust
let [one, two, three] = [1, 2, 3];
```
</a>

On the other hand, there's [a lot more you can do with destructuring](https://doc.rust-lang.org/book/second-edition/ch18-03-pattern-syntax.html) apart from multiple assignments. You can write beautiful, ergonomic code using pattern syntax.

<a class="example" href="https://play.rust-lang.org/?gist=969612861bc6028e3b98345e21a4289e&version=stable">
<div class="rust lang-icon"></div>

```rust
let x = 4;
let y = false;

match x {
    4 | 5 | 6 if y => println!("yes"),
    _ => println!("no"),
}
```
</a>

To quote *[The Book](https://doc.rust-lang.org/book/second-edition/ch18-03-pattern-syntax.html)*:

> This prints `no` since the if condition applies to the whole pattern `4 | 5 | 6`, not only to the last value 6.


## String interpolation

Ruby has [extensive string interpolation support](http://ruby-doc.org/docs/ruby-doc-bundle/ProgrammingRuby/book/ref_m_kernel.html#Kernel.sprintf).

<a class="example" href="https://gist.github.com/LeandroTk/5125cab5e74d26460124c786ac5df534#file-interpolation-rb">
<div class="ruby lang-icon"></div>

```ruby
programming_language = "Ruby"
"#{programming_language} is a beautiful programming language"
```
</a>

This can be translated like so:

<a class="example" href="https://play.rust-lang.org/?gist=6920e723137e44c4befe3398721fafa1&version=stable">
<div class="rust lang-icon"></div>

```rust
let programming_language = "Rust";
format!("{} is also a beautiful programming language", programming_language);
```
</a>

Named arguments are also possible, albeit much less common:

<a class="example" href="https://play.rust-lang.org/?gist=6920e723137e44c4befe3398721fafa1&version=stable">
<div class="rust lang-icon"></div>

```rust
println!("{language} is also a beautiful programming language", language="Rust");
```
</a>

Rust's `println!()` syntax is even more extensive than Ruby's. [Check the docs](https://doc.rust-lang.org/std/fmt/) if you're curious about what else you can do.

## That’s it!

Ruby comes with syntactic sugar for many common usage patterns, which allows for very elegant code.
Low-level programming and raw performance are no primary goals of the language.

If you do need that, Rust might be a good fit, because it provides fine-grained hardware control with comparable ergonomics.
If in doubt, Rust favors explicitness, though; it eschews magic.

Did I whet your appetite for idiomatic Rust? Have a look at [this Github project](https://github.com/mre/idiomatic-rust). I'd be thankful for contributions.


## Footnotes

<sup id="fn1">1. Thanks to <a href="https://twitter.com/Argorak">Florian Gilcher</a> for the hint.<a href="#ref1" title="Jump back to footnote 1 in the text.">↩</a></sup>  
<sup id="fn2">2. Thanks to <a href="https://www.reddit.com/user/masklinn">masklin</a> for pointing out multiple inaccuracies.<a href="#ref2" title="Jump back to footnote 2 in the text.">↩</a></sup>  
<sup id="fn3">3. In the first version, I sait that `ok()` would convert a `Result` into a `boolean`, which was wrong. Thanks to <a href="https://news.ycombinator.com/item?id=16003080">isaacg</a> for the correction.<a href="#ref3" title="Jump back to footnote 3 in the text.">↩</a></sup>  
