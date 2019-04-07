+++
title="Functional Programming for Mathematical Computing"
date=2018-01-02
+++


Programming languages help us describe general solutions for problems; the result just happens to be executable by machines. Every programming language comes with a different set of strengths and weaknesses, one reason being that its syntax and semantics heavily influence the range of problems which can easily be tackled with it.

**tl;dr:** *I think that functional programming is better suited for mathematical computations than the more common imperative approach.*

## Using built-in abstractions for Mathematics

The ideas behind a language (the underlying programming paradigms) are distinctive for the community that builds around it. The developers create a unique ecosystem of ready-to-use libraries and frameworks around the language core. As a consequence, some languages are stronger in areas such as business applications (one could think of Cobol), others work great for systems programming (like C or Rust).

When it comes to solving mathematical and numerical problems with computers, Fortran might come to mind. Although Fortran is a general-purpose language, it is mostly known for scientific computing. Of course, the language was created with that purpose in mind – hence the name, *Formula Translation*.

One reason for its popularity in this area is that it offers some built-in domain-specific keywords to express mathematical concepts, while keeping an eye on performance. For instance, it has a dedicated datatype for complex numbers – `COMPLEX` – and a keyword named `DIMENSION` which is quite similar to the mathematical term and can be used to create arrays and vectors.

## Imperative vs functional style

Built-in keywords can help expand the expressiveness of a language into a specific problem space, but this approach is severly limited. It’s not feasible to extend the language core *ad infinitum*; it would just be harder to maintain and take longer to learn. Therefore, most languages provide other ways of abstraction – like *functions*, *subroutines*, *classes* and *objects* – to split a routine into smaller, more manageable parts. These mechanisms might help to control the complexity of a program, but especially when dealing with mathematical problems, one has to be careful not to obfuscate the solution with boilerplate code.

### Specimen I - Factorial

As an example, the stated problem might be to translate the following formula, which calculates the factorial of a positive number n, into program code:


![The mathematical definition of a faculty: n! = 1 * 2 * 3 ... * n](./example_faculty.svg)


An implementation of the above formula using imperative style Java might look like this:

```java
public static long fact(final int n) {
    if (n < 0) {
        // Negative numbers not allowed
        return 0;
    }
    long prod = 1;
    for (int i = 1; i <= n; ++i) {
        prod *= i;
    }
    return prod;
}
```

This is quite a long solution for such a short problem definition.
(Note that writing a version with an explicit loop from 1 to n was on purpose; a recursive function would be shorter, but uses a concept which was not introduced by the mathematical formula.)

Also, the program contains many language-specific keywords, such as `public`, `static`, and `System.err.println()`. On top of that, the programmer must explicitly provide all data types for the variables in use – a tiresome obligation.  

All of this obfuscates the mathematical definition.

Compare this with the following version written in a functional language, like Haskell.

```haskell
fact n = product [1..n]
```

This is an almost direct translation from the problem definition into code. It needs no explicit types, no temporary variables and no access modifiers (such as public).

### Specimen II - Dot product

One could argue that the above Haskell program owes its brevity to the fact, that the language provides just the right abstractions (namely the `product` keyword and the `[1..n]` range syntax) for that specific task.
Therfore let’s examine a simple function which is neither available in Haskell nor in Java: The dot product of two vectors. The mathematical definition is as follows:

![The mathematical definition of a vector dot product: a·b= aibi =a1b1+a2b2+···+anbn =abT]( ./example_vector_dot.svg) 

For vectors with three dimensions, it can be written as

![Vector dot product for three dimentsions: a·b = a1 * b1 + a2 * b2 + a3* b3]( ./example_vector_3d.svg)

First, a Haskell implementation:

```haskell
type Scalar a = a
data Vector a = Vector a a a deriving (Show)
dot :: (Num a) => Vector a -> Vector a -> Scalar a
(Vector a1 a2 a3) `dot` (Vector b1 b2 b3) = a1*b1 + a2*b2 + a3*b3
```

Note, that the mathematical types can be defined in one line each. Further note, that we define the dot function in infix notation, that is, we place the first argument of dot in front of the function name and the second argument behind it. This way, the code looks more like its mathematical equivalent.
An example call of the above function would be 

```haskell
(Vector 1 2 3) ’dot’ (Vector 3 2 1)
```

which is short, precise and readable.

Now, a similar implementation in Java.

```java
public static class Vector<T extends Number> {
    private T x, y, z;

    public Vector(T x, T y, T z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public double dot(Vector<?> v) {
        return (x.doubleValue() * v.x.doubleValue() +
                y.doubleValue() * v.y.doubleValue() +
                z.doubleValue() * v.z.doubleValue());
        }
    }

    public static void main(String[] args) {
        Vector<Integer> a = new Vector<Integer>(3, 2, 1);
        Vector<Integer> b = new Vector<Integer>(1, 2, 3);
        System.out.println(a.dot(b));
    }
}
```

For a proper textual representation of Vectors, the toString() Method would also need to be overwritten. In Haskell, one can simply derive from the `Show` typeclass as shown in the code.

## Creating new abstractions

If functions and types are not sufficient to write straightforward programs, Haskell also offers simple constructs to create new operators and keywords which extend the language core itself. This makes domain-specific-languages feasible and enables the developer to work more directly on the actual problem instead of working around peculiarities of the programming language itself (such as memory management or array iteration). Haskell embraces this concept; Java has no such functionality.

## Conclusion

I'm not trying to bash Java or worship Haskell here. Both languages have their place.
I merely picked Java, because lots of programmers can read it.

The comparison is more between a functional and an imperative approach for numerical and symbolical programming; and for that, I prefer a functional approach every day. It removes clutter and yields elegant solutions. It provides convenient methods to work on a high level of abstraction and speak in mathematical terms and still, these strengths are disregarded by many programmers.

Abraham H. Maslow’s observation in his 1966 book [The Psychology of Science](https://www.goodreads.com/book/show/1510050.The_Psychology_of_Science) seems fitting:

> “I suppose it is tempting, if the only tool you have is a hammer, to treat everything as if it were a nail.”