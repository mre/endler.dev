+++
title="Of Boxes and Trees - Smart Pointers in Rust"
date=2017-08-12

[extra]
comments = [
  {name = "Reddit", url = "https://www.reddit.com/r/rust/comments/6tkyz3/of_boxes_and_trees_smart_pointers_in_rust/"}
]
+++

Recently, I tried to implement a binary tree data structure in Rust.
Each binary tree has a root value, a left, and a right subtree.
I started from this Python implementation, which is quite straightforward.

<!-- more -->

```python
class Tree:
  def __init__(self, val, left=None, right=None):
    self.val = val
    self.left = left
    self.right = right
```

This allows us to declare a fancy tree object like this:

```python
t = Tree(15,
      Tree(12,
           None,
           Tree(13)),
      Tree(22,
           Tree(18),
           Tree(100)))
```

And the result can be visualized beautifully.  
(Yes I've drawn that myself.)

{{ figure(src="./tree.svg", caption="A binary search tree representing our data structure") }}

Porting that code to Rust turned out to be a little... challenging.
My first attempt looked quite innocuous.

```rust
struct Tree {
  root: i64,
  left: Tree,
  right: Tree,
}
```

That's pretty much a one-to-one translation of the Python definition &mdash; but [**`rustc`** **says no**](https://www.youtube.com/watch?v=0n_Ty_72Qds).

```rust
error[E0072]: recursive type `Tree` has infinite size
 --> src/main.rs:1:1
  |
1 | struct Tree {
  | ^^^^^^^^^^^ recursive type has infinite size
  |
  = help: insert indirection (e.g., a `Box`, `Rc`, or `&`) at some point to make `Tree` representable
```

Coming from memory-managed languages (like Python, PHP, or Ruby), I was confused by this.
The problem is easy to understand, though.
Computers have a limited amount of memory.
It's the compiler's job to find out how much memory to allocate for each item.

In our case, it infers the following:

A tree is a structure containing an `i64`, and two trees. Each of these trees is a structure containing an `i64`, and two trees. Each of these...  
[You get the idea.](https://stackoverflow.com/a/25296420/270334)

```rust
Tree { i64, Tree, Tree }
Tree { i64, Tree { ... }, Tree { ... } }
// The next expansion won't fit on the page anymore
```

Since we don't know how many subtrees our tree will have, there is no way to tell how much memory we need to allocate up front. We'll only know at runtime!

Rust tells us how to fix that: by inserting an *indirection* like `Box`, `Rc`, or `&`.
These are different "pointer types" in Rust. They all point to places in memory. So, instead of knowing the total size of our tree structure, we just know the *point* in memory where the tree is located. But that's enough to define the tree structure.
These pointer types allow us to do that safely and without manual memory management.
They all offer different guarantees and you should [choose the one that fits your requirements best](./posts/2017/why-type-systems-matter/index.md).

* `&` is called a `borrow` in Rust speech. It's the most common of the three. It's a reference to some place in memory, but it does not **own** the data it points to. As such, the lifetime of the borrow depends on its owner.
Therefore we would need to add lifetime parameters here. This can make it tedious to use.

    ```rust
    struct Tree<'a> {
      root: i64,
      left: &'a Tree<'a>,
      right: &'a Tree<'a>,
    }
    ```

* [`Box`](https://doc.rust-lang.org/std/boxed/struct.Box.html) is a **smart pointer** with zero runtime overhead. It owns the data it points to.
We call it smart because when it goes out of scope, it will first drop the data it points to and then itself. No manual memory management required.

    ```rust
    struct Tree {
      root: i64,
      left: Box<Tree>,
      right: Box<Tree>,
    }
    ```

* [`Rc`](https://doc.rust-lang.org/std/rc/struct.Rc.html) is another smart pointer. It's short for "reference-counting". It keeps track of the number of references to a data structure. As soon as the number of references is down to zero, it cleans up after itself.
Choose `Rc` if you need to have multiple owners of the same data in one thread.
For multithreading, there's also [`Arc`](https://doc.rust-lang.org/std/sync/struct.Arc.html) (atomic reference count).

    ```rust
    struct Tree {
      root: i64,
      left: Rc<Tree>,
      right: Rc<Tree>,
    }
    ```

## Putting the tree into a box

All three options are totally valid. Which one you should choose, depends on your use-case.
A rule of thumb is to keep it simple.
In my case, I chose to use a `Box`, because I did not need any special guarantees.

## Making subtrees optional

The next problem I faced was that I could not instantiate a tree structure.
The left and right subtree have the type `Box<Tree>`, but at some
point I would need an empty subtree.

In the Python example, I used `None` to signal the end of my data structure.
Thanks to Rust's [`Option`](https://doc.rust-lang.org/std/option/) type we can do the same:

``` rust
struct Tree {
  root: i64,
  left: Option<Box<Tree>>,
  right: Option<Box<Tree>>,
}
```

After all of this, we can create our first tree:

```rust
Tree {
    root: 15,
    left: Some(Box::new(Tree {
            root: 12,
            left: None,
            right: Some(Box::new(Tree {
                    root: 13,
                    left: None,
                    right: None,
            })),
    })),
    right: Some(Box::new(Tree {
            root: 22,
            left: Some(Box::new(Tree {
                    root: 18,
                    left: None,
                    right: None,
            })),
            right: Some(Box::new(Tree {
                    root: 100,
                    left: None,
                    right: None,
            })),
    })),
};
```

Depending on your point of view, you might say this is either verbose or explicit.
Compared to the Python version, it looked a bit too cluttered.

Can we do better?
[Chris McDonald](https://github.com/cjm00) helped me to come up with the following representation:

```rust
Tree::new(15)
  .left(
    Tree::new(12)
      .right(Tree::new(13))
  )
  .right(
    Tree::new(22)
      .left(Tree::new(18))
      .right(Tree::new(100))
  );
```

To me, this is much easier on the eye.  
Here's the full tree implementation that makes this possible:

```rust
#[derive(Default)]
struct Tree {
  root: i64,
  left: Option<Box<Tree>>,
  right: Option<Box<Tree>>,
}

impl Tree {
  fn new(root: i64) -> Tree {
    Tree {
      root: root,
      ..Default::default()
    }
  }

  fn left(mut self, leaf: Tree) -> Self {
    self.left = Some(Box::new(leaf));
    self
  }

  fn right(mut self, leaf: Tree) -> Self {
    self.right = Some(Box::new(leaf));
    self
  }
}
```

**Update:** [Danny Grein](https://twitter.com/fungos) mentioned on Twitter, that
we can support the following syntax by implementing [`From<i64> for Tree`](https://play.rust-lang.org/?gist=1454d2bfdacf0c83434a3095b0adcb5d&version=stable):

```rust
root(15)
  .left(root(12).right(13))
  .right(root(22).left(18).right(100));
```

## Why did it work in Python?

Now you might be wondering, why our tree implementation worked so flawlessly in Python.
The reason is that Python dynamically allocates memory for the tree object at runtime.
Also, it wraps everything inside a [PyObject, which is kind of similar to `Rc` from above](http://pythonextensionpatterns.readthedocs.io/en/latest/refcount.html)
&mdash; a reference counted smart pointer.

Rust is more explicit here. It gives us more flexibility to express our needs.
Then again, we need to know about all the possible alternatives to make good use of them.
If you can, then stay away from smart pointers and stick to simple borrows.  
If that's not possible, as seen above, choose the least invasive one for your
use-case. The [Rust documentation](https://doc.rust-lang.org/book/second-edition/ch15-00-smart-pointers.html) is a good starting point here.
Also, read ["Idiomatic tree and graph-like structures in Rust"](https://rust-leipzig.github.io/architecture/2016/12/20/idiomatic-trees-in-rust/) for some clever use of allocators.

