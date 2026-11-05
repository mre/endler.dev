+++
title="Wrong Ways To Create Strings"
date=2026-11-05
draft=false
[taxonomies]
tags=["rust"]
+++

I'm on my way back from RustLab 2026, where I gave a lightning talk about all the ways to create a `String` in Rust that don't involve `String::new`.
The talks were not recorded, so I decided to write it up as a blog post.

## Collect Some Characters

One of the most obvious ways to create a string without calling `String::new` is to collect some characters into a string:

```rust
let ferris: String = ['f', 'e', 'r', 'r', 'i', 's']
    .into_iter()
    .collect();
```

Alternatively, you can start with the UTF-8 bytes:

```rust
let ferris = String::from_utf8(vec![102, 101, 114, 114, 105, 115])
    .unwrap();
```

## Derive Debug 

If we derive `Debug` for an enum, we can format a variant as a string.
Note that debug output isn't a stable serialization format, so this just happens to work for this particular string. 

```rust
#[allow(non_camel_case_types)]
#[derive(Debug)]
enum Mascot {
    ferris,
}

let ferris = format!("{:?}", Mascot::ferris);
```

## Use a CString 

This is another very obvious one: we can use `CString` to create a string with a NUL terminator, then convert it back to a `String`.
Converting it back removes the terminator and checks that the remaining bytes are valid UTF-8.

```rust
let ferris = std::ffi::CString::new("ferris")
    .unwrap()
    .into_string()
    .unwrap();
```

## Use `unwrap_err` 

If we supply an invalid string to `CString::new`, it will return an error instead of panicking.
We can abuse that fact and call `unwrap_err()` on the result to get the error, which **gives us the rejected bytes back**.

```rust
let mut bytes = std::ffi::CString::new(b"ferris\0".to_vec())
    .unwrap_err()
    .into_vec();
```

All we have to do now is remove the invalid NUL byte we added: 

```rust
bytes.pop();
```

Now can convert each byte back to a character.

```rust
let ferris: String = bytes.into_iter().map(char::from).collect();
```

`char::from(u8)` is safe because every `u8` value (0–255) corresponds to a valid Unicode character.
It does not decode UTF-8; it simply converts each byte into a Unicode code point.
When collecting these characters into a `String`, Rust automatically encodes them as valid UTF-8.
Therefore, the conversion cannot fail, but the resulting text may be incorrect if the original bytes represented multibyte UTF-8 characters.

## Statically include some text with `include_str!` 

Create a file called `file.rs` containing exactly `ferris`, without a trailing
newline.
In another Rust file, we can include that text at compile time:

```rust
let ferris = include_str!("file.rs").to_owned();
```

The extension doesn't matter.
`include_str!` embeds the file as UTF-8 text at compile time; it doesn't try to parse it as Rust.

## Thread Shenanigans

Threads can have names, and we can read the name of the current thread.
We can abuse that to create a string by naming a thread and then reading its name from another thread.

```rust
let builder = std::thread::Builder::new()
    .name("ferris".to_owned());
```

Then let it read its own name and send it back:

```rust
let ferris = builder
    .spawn(|| std::thread::current().name().unwrap().to_owned())
    .unwrap()  // handle creation errors
    .join()    // wait for the thread to finish
    .unwrap(); // handle a panic in the thread
```

The name is borrowed from the thread handle; that's why we copy it into an owned string.

## Ask Another Process

Instead of threads, you can also spawn a child process and read its output.

```rust
use std::process::Command;

fn main() {
    if std::env::args_os().any(|arg| arg == "--child") {
        print!("ferris");
        return;
    }

    let child = Command::new(std::env::current_exe().unwrap())
        .arg("--child")
        .output()
        .unwrap();

    assert!(child.status.success());
    let ferris = String::from_utf8(child.stdout).unwrap();
}
```

The child prints the string and exits.
The parent waits for it, checks its exit status, and converts the captured stdout into a `String`.

## Store It in a Float

```rust
let crab = f64::from_bits(0x0000_7369_7272_6566);
```

Those bits, read as little-endian bytes, are `['f', 'e', 'r', 'r', 'i', 's', 0, 0]`.
We can use `from_bits` to avoid the numeric conversion of these bytes.

Now extract the characters and discard the two padding bytes:

```rust
let [f, e, r1, r2, i, s, ..] = crab.to_bits().to_le_bytes().map(char::from);
let ferris = format!("{f}{e}{r1}{r2}{i}{s}");
```

Note how I use `r1` and `r2` here.
That's because these are two separate variables, not characters.
Using `to_le_bytes()` makes this independent of the machine's byte order.

All we have to do is format the variables back into a string.

## Assemble a String From Raw Parts

A `String` in Rust is just a pointer to a heap allocation, along with a length and capacity.
We can manually create an instance of that type, but we have to be careful to get the layout, length, capacity, and UTF-8 validity right ourselves.

```rust
let crab = Box::new(*b"ferris");
let pointer = Box::into_raw(crab).cast::<u8>();
let ferris = unsafe { String::from_raw_parts(pointer, 6, 6) };
```

`Box::into_raw` gives up ownership without freeing the allocation.
The `String` takes over and will free it when dropped.

## Using the Type Name

Every type in Rust has a name.
We can use `std::any::type_name` to get the name of a type as a string.
So if we create a type with the string we want, we can get that string back from the type name.

```rust
#[allow(non_camel_case_types)]
struct ferris;

let name = std::any::type_name::<ferris>();
```

The name can include the module path, so we take the last component, then "parse" it as a string:

```rust
let result = name
    .rsplit("::")
    .next()
    .unwrap()
    .parse::<String>()
    .unwrap();
```

Note that `type_name` does not have a stable naming API, so the exact output is unspecified.

## Deliver It Through a Panic

Maybe one of my favorite ways to create a string is to panic with it and catch the panic.

```rust
let ferris = *std::panic::catch_unwind(|| {
    std::panic::panic_any(format!("ferris"));
})
.unwrap_err()
.downcast::<String>()
.unwrap();
```

That works because the panic carries an owned `String`.
Catching it gives us the payload, downcasting gives us a `Box<String>`, and dereferencing moves the string out of the box.

This requires [unwinding](https://doc.rust-lang.org/nomicon/unwinding.html).
With `panic = "abort"`, the process would just exit instead.

## Use Only Padding

`format!` is one of the most powerful macros in the Rust standard library.
It supports "format specifiers" that let you control how the output is formatted in exactly the way you want.

One feature is `>`, which right-aligns the output and pads it with a fill character.
The character before `>` in a format specifier is the fill character.
The number is the minimum width:

```rust
let hello = "hello";
assert_eq!(format!("{hello:o>10}"), "ooooohello");
```

Knowing this, we can completely abuse specifiers to pad an empty string with each letter we need.
Argument `0` lets us reuse the same empty string:

```rust
let ferris = format!("{0:f>1}{0:e>1}{0:r>2}{0:i>1}{0:s>1}", "");
```

So we take an empty string and pad it with `f`, then `e`, then `r` twice, then `i`, then `s`.
I like how we use `r>2` to get two `r`s instead of writing `r>1` twice like a peasant.

## That was fun!

Did I forget an interesting way to create a string? 
One more way I didn't have the time to show in the talk is to use `rand` to extract random bytes from memory and hope they form the string you want.

In general, I love solving problems in unconventional ways.
You might also like my 2023 RustLab lightning talk on [Printing Things The Wrong Way](/2023/cursed-rust).
