+++
title="Overkill – Java as a First Programming Language"
date=2010-02-12
updated=2020-03-17
[taxonomies]
tags=["culture", "dev"]

[extra]
comments = [
  {name = "Hacker News", url = "https://news.ycombinator.com/item?id=13926407"}
]
+++

I recently talked to a student in my neighborhood about his first programming
experiences. They started learning _Java_ at school, and it soon turned out to
be horrible.

A lot of us learned to code in languages like _BASIC_ or _Pascal_. There was no
object orientation, no sophisticated file I/O and almost no modularization...
and it was great. In _BASIC_ you could just write

```python
PRINT "HELLO WORLD"
```

and you were done. This was actually a running program solving a basic and
reoccurring problem: Output some text on a screen.

If you wanted to do the same thing in _Java_ you just write:

```java
public class Main {
  public static void main (String[] args) {
    System.out.println("Hello, world!");
  }
}
```

Do you see how much knowledge about programming you must have to achieve the
easiest task one could think of? Describing the program to a novice programmer
may sound like this:

> Create a Main class containing a main-method returning void expecting a string
> array as a single argument using the `println` method of the `out` object of
> class `PrintStream` passing your text as a single argument.

&mdash; please just don't forget your brackets. This way your first programming
hours are guaranteed to be great fun.

OK. So what are the alternatives? I admit that nobody wants to write _BASIC_
anymore because of its lack of a sophisticated standard library for graphics
(_Java_ doesn't have one either) and its weak scalability. The language has to
be clean and straightforward. It should be fast enough for numerical tasks but
not as wordy as the rigid C-type bracket languages (sorry C++ guys). It should
have a smooth learning curve and provide direct feedback (compiled languages
often suck at that point). It should encourage clean code and reward best
practices. One language that provides all that is _*Python*_.

And _Python_ has even more: hundreds of libraries that help you with almost
everything, good integration into common IDEs (PyDev in Eclipse, IDLE...), a
precise and elegant syntax.

Here is our program from above written in _Python_:

```python
print("Hello World")
```

There's no need to know about object orientation, scopes and function arguments
at this point. No householding or book-keeping. Yes, it's an interpreted
language, but that's not a deal breaker for beginners.

If you aren't convinced yet, printing and formatting text output in _Java_ is
relatively easy for an advanced programmer but the gruesome stuff begins with
file input:

```java
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class fileIO {
    public static void main(String[] args) {
        String filename = "test.txt", line;
        try {
            BufferedReader myFile =
                new BufferedReader(new FileReader(filename));

            while ( ( line = myFile.readLine()) != null) {
                System.out.println(line);
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

I hear you say: "Dude, file I/O is pretty complex. It's just the way it is".
That's true... _internally_ . But a beginner should get an easy interface.
_Python_ shows how it's done:

```python
file = open("test.txt")
text = file.read()
print(text);
```

The code goes hand in hand with the natural understanding of how the process
works: "The computer opens a file, reads it and prints it". Even a five-year-old
kid can understand that. Nobody would start to explain: "Before you can read a
file you need a BufferedReader that works on a FileReader..." even if this is
precisely how it works _internally_. You want to explain the big picture at
first. The elementary principles of teaching a computer how to do useful stuff.
Otherwise, you will start frustrating beginners and fool them into thinking that
they are not bright enough for programming. Programming is fun and starting with
it is the most crucial step. So don't spoil that experience with layers of
unneeded abstraction.

## Links

- Response to this article (almost ten years later): [Why Kotlin may be better than Java and Python as the first programming language](https://dev.to/dzh/why-kotlin-may-be-better-than-java-and-python-as-the-first-programming-language-37d5)
