---
title: Fixed size arrays in Typescript
date: 2018-06-08 09:00:00
tags:
- typescript
- dependent types
---

Dependent types are types whose definition depends on a value (from Wikipedia).

Typescript does not support dependent types _per se_. However, literal types, even if they are not actual values, allow us to do some interesting things.

For instance, a classical introductory example to dependent types involves the definition of arrays of fixed length. It turns out that we can define, with some limitations, a type for arrays of fixed size in Typescript, too.

Let's see in details what we are going to replicate in Typescript.

In many modern programming language, it is possible to define arrays whose elements have a given type, let's say strings. In Typescript, we write:

```javascript
let a: Array<string>;
a = []; // ok
a = [ 'a' ]; // ok
a = [ true ]; // type error!
```

Dependent types parametrize type definition by values of another type. In the case of arrays we can define arrays of fixed size, for example:

```javascript
let a: Array<2, string>;
a = [ 'a', 'b' ]; // ok
a = [ 'a' ]; // type error!
```

In the example above, the size of arrays is checked at compile time. This means that, if a program compiles correctly, then we will not have a runtime exception because the size of the array is always what we expect.

I created an [npm package](https://www.npmjs.com/package/fixed-size-array) with the type definition. It boils down to [few lines of code](https://github.com/mstn/fixed-size-array/).

```javascript
type FixedSizeArray<N extends number, T> = N extends 0 ? never[] : {
    0: T;
    length: N;
} & ReadonlyArray<T>;
```

Let's see in details why and when it works.

First, we use the trick introduced in Typescript 2.7 for fixed size tuples. The `length` of an array has a numeric literal type. We need it to match tuples of exact size.

```javascript
let d: FixedSizeArray<2, string>;

d = [ 'a', 'b' ]; // ok
d = [ 'a' ]; // type error
d = [ 'a', 'b', 'c' ]; // type error
```

The intersection with `ReadonlyArray<T>` is needed to enforce the type of the array elements to be `T`. In addition, fixed size arrays inherit methods of `ReadonlyArray`.

```javascript
d = ['a', true]; // type error
d = [true, 'a']; // type error
```

We use conditional types (Typescript >=2.8) for handling zero length arrays. In Typescript (>= 2.8) the type of `[]` is always `never[]`; so, if `N` is `0`, the type must be `never[]`.

```javascript
let e: FixedSizeArray<0, string>;

e = []; // ok
e = [ 'a' ]; // type error
e = [] as string[]; // type error
```

Finally, property `0` is required because we can assign tuples only to tuple-like objects and a tuple-like object must have at least `0` defined by design ([source](https://github.com/Microsoft/TypeScript/issues/24680#issuecomment-394616609)).

As pointed out by @AnyhowStep [here](https://github.com/Microsoft/TypeScript/issues/24680#issuecomment-394710740), we can see the limitations of this approach when we try to access elements through their indexes.

```javascript
let a: FixedSizeArray<2, string>;
a = [ '1', '2' ]; // ok
a[0] = '1'; // ok
a[1] = '2'; // type error, but it should be ok
```

Another more complex example showing the same problem with `keyof` type constructor.

```javascript
type Range<N extends number> = keyof FixedSizeArray<2, string>;

let r: Range<2>; // it is '0' | 'length' | ... (read only array props)

r = 'length';
r = '0';
r = '1'; // error! I would not expect an error
```

A better implementation could use [range types](https://github.com/Microsoft/TypeScript/issues/15480). At the moment Typescript does not support range types and, as far as I know, range types are not on their roadmap in any near future. However, if we had a `range` operator similar to `keyof` operator, we could fix the problem above and simplify the definition with:

```ts
type FixedSizeArray<U extends number, T> = {
    [k in range(U)]: T;
} & { length: U };
```

Another limitation is that it is not possible to do any arithmetic with numeric literal types in Typescript. Apparently, Typescript developers have found some [technical problems](https://github.com/Microsoft/TypeScript/issues/8112). It is a pity! With numeric literal type arithmetic we could define, for example, that `insert` applied to an array of length `N` will return an array of lenght `N+1`. Since this is not possible for now, we have to stick to immutable arrays.

Compared with the full firepower of dependent types, our arrays seem a little thing. Still, having a type for immutable arrays of a given length is a lovely feature to have in many practical cases. For example, in React we could specify the exact number of children a parent can have. Another example is a function that requires two array arguments of the same length.

I wonder if we can find any hacks for current limitations without introducing new constructs to the language.

A common criticism to dependent types is that they are quite complex to handle for humble programmers. Hence, I think it is interesting to see which features of dependent types can be expressed or mimicked in a programming language without importing all their complexity.

It would be interesting to understand if we can prove "theorems" on Typscript programs using its type system in a similar way to what is done in dependent type languages. [Tycho](https://github.com/tycho01) has been developing [an experimental library](https://github.com/tycho01/typical) of type-level operations for TypeScript. I think it could be a good starting point.

## Credits

Numeric literals for array length has been used for tuples [since TS 2.7](https://github.com/Microsoft/TypeScript/pull/17765).

Type definition had been simplified as suggested [here](https://github.com/Microsoft/TypeScript/issues/6229#issuecomment-376988681) by @tycho01.

Daniel explained me better how typing works with tuples [here](https://github.com/Microsoft/TypeScript/issues/24680#issuecomment-394616609).

## References

Wikipedia, [Dependent Type](https://en.wikipedia.org/wiki/Dependent_type), accessed 10/04/2018

## More resources

* [Source code](https://github.com/mstn/fixed-size-array/)
* [NPM package](https://www.npmjs.com/package/fixed-size-array)
