---
title: Typescript for typeless people
date: 2019-07-27 09:00:00
tags:
- type theory
- software engineering
- typescript
---
 
Typescript is becoming very popular. It is one of the ten most used languages on Github and its adoption has increased a lot in the past years ([source](https://hackernoon.com/major-programming-trends-to-prepare-for-in-2019-169987cc75f4)). The success of Typescript is in part due to the current trend in software engineering that rediscovered types. Strongly typeness and safety have become desirable properties of our programming languages to such a point that the terms are often used in an improper way, like marketing buzzwords, and types have acquired thaumaturgical qualities, like producing bug-free code or transforming frogs into 10x programmers.
 
# Types are just a tool
 
I am old enough to remember the times when types were considered harmful. Thus, I am very skeptic when people rediscover a technology or an idea.
 
Some common objections against types were and are:
 
* Types add overhead and reduce productivity.
* There is no real case when you absolutely need them.
 
I generally agree that these opinions are _sometimes_ true.
 
I do not think that _any_ silver-bullet can increase productivity. Software production is a complex process where several factors come into play and a single technology, methodology or tools are not enough to determine the fate of a project.
 
Actually, some tools can increase programming productivity. I think that it is "scientifically" proved that big screens can.
If I have to choose between a big screen and a typed language, I will choose the former without any doubt.
However, a tool is useful if you use it in the right way.
If you sit on your monitor instead of watching it, it won't increase your productivity at all.
You should also switch it on, at least I was told so.
 
Types are tools like big screens. However, they are more sophisticated than a monitor.
This means that it could be difficult to find the right way to use them. And, on the other side, it is easier to be overwhelmed by them.
 
# To type or not to type: that's the (wrong) question
 
There is also a second aspect. What do we mean with "types"? How many different ways to use types in programming languages exist?
 
Programmers have a binary view of the world: good and bad, 0 and 1. When they evaluate a tool, they tend to manifest
strong opinions (like me in this post maybe): "it is crap" or "it is awesome". But life is usually more complex than that.
 
The real question is not "to type or not to type".
Types are not a binary feature of programming languages. It does not make sense to talk about typeful and typeless
because it is not the case that a language can be with or without types.
 
All programming languages have a type system. But all type systems are different.
 
I think that the hostility against types has historical roots. Around 2008 people started to complain about types and the typeless revolution began.
In my opinion, that was not a revolt against all type systems, but against Java. Java was the language taught in universities and used in industry.
It came with the promise of a better world. In reality it carried to us only a heavy type system.
 
I did not like Java. I do not know if things improved over there. I am biased toward it and probably what I say is unfair.
However, I think that some of the objections against types are objections against Java/C++/C# type systems.
As such I agree with them.
 
Something similar happened in the database land. In the same years, people got fed up with the traditional databases, that is, SQL.
A lot of new paradigms emerged. A few of them survived (e.g. MongoDB) with criticisms and we are rediscovering now that SQL was not that bad.
In this case, in my opinion, the war was not against SQL in itself, but against the lack of tools. Do you remember Oracle and
how easy was in comparison to work with MongoDB? If something good was left by the NoSQL revolution, it is more attention to the quality of tools for developers, from code editors to debugging tools and database user interfaces.
 
So, what about Typescript? It is not a magic wand, for sure. However, I believe that it can be useful in some contexts and when properly used. In addition, its type system has the flexibility and hackability of some dynamic languages. But hold on a minute and let me introduce some terminology.
 
# A little type theory
 
Here is a quick recap based on Wikipedia.
 
* **Type checking** is the process of verifying type constraints
* **Static type checking** is type checking at compile time
* **Dynamic type checking** is type checking at runtime
* **Strongly typed** is an informal notion and means roughly "how much I am allowed to violate type constraints". For example, if `x` is of type integer, it cannot be multiplied by `0.2` in a very strongly typed language because multiplication over floats is not allowed over integers.
* **Explicit** means that every variable must be typed.
* **Implicit** means that some types can be inferred by the compiler or interpreter.
* **Safety** is a property that Milner expressed as "Well-typed programs cannot go wrong". In other words, if we can assign a type to an expression, we are sure that that expression can be evaluated without surprises.
* **Inheritance** is a `is-a` relation. Tom `is-a` cat, but Tom `is-a` an animal, too. There are at least two kinds of inheritance: structural and nominal. Nominal inheritance means that an item is labelled with its type: Tom `is-a` cat because I say it is a cat. Structural inheritance means that two items are the same if they share the same properties. Duck typing is a sort of structural inheritance. Here, we do not consider prototypical inheritance typical of Javascript.
 
This is a table with some examples from some programming languages.
 
|              | type checking      | strong/weak    | typing              |  safety  | inheritance |
|--------------|--------------------|----------------|---------------------|----------|-------------|
| Typescript   | static/type guards | strong, but... | implicit            |   no     |  structural |
| Java         | static/dynamic     | strong         | explicit            |   yes    |  nominal    |
| Ruby         | dynamic            | strong         |   ?                 |   NA     |  duck       |
| Python       | dynamic            | strong         | both (?)            |   NA     |  duck       |
| Javascript   | dynamic            | weak           | NA                  |   NA     |  NA         |
 
Java has (had?) an explicit type system and is (was?) based on nominal inheritance.
This means that every variable must be typed and hierarchies of classes and interfaces tend to emerge.
In my opinion, for this reason Java type system is heavy and adds overhead.
When you change a type, you have to chase all the type errors in the hierarchy.
So you do not have to maintain your code base, but also your types.
 
# Typescript is lightweight, if used wisely (imo)
 
Typescript is statically typed, but its type system is very different from Java's. In my opinion, it is closer to Ruby than Java!
 
* Structural inheritance is similar to duck typing (but a property must exist at compile time).
* Typing is implicit and types can be inferred (but there is no run time check).
* Type guards and disjoint unions allow us to emulate dynamic typing at run time.
* Typescript intentionally sets a trade off between safety and developer productivity. So, it is ok to be unsafe.
 
Typescript is implicit. You can assign a type to every variable like in the snippet below, if you enjoy it.
But you do not have to. Typescript is able to infer the correct types.
 
```typescript
const x: number = 2;
const x: User = { name: 'Marco' };
```
 
Typescript interfaces have structural inheritance (but there is a proposal also for nominal). The following snippet of code compiles.
Doesn't it look like duck typing?
 
```typescript
interface Dog{}
interface Duck{}
function cook(d: Duck) {}
const spot: Dog = {}
cook(spot)
```
 
In Typescript there are classes and interfaces, but you do not have to build hierarchies. Flat data models are always better.
In this way, you avoid premature and wrong abstractions
 
Typescript is strong as Ruby and Java, but it is a different flavor of being strongly typed.
As a human being, you might know the run time type of an expression better than a dumb algorithm.
It might depend on contextual information you have, which is not inferable from code.
You can take advantage of your über-Turing powers to increase your productivity.
You can show that AI has not won the war against humans with syntactic constructs like
 
* `!` (“hey compiler, I am sure this is not `null`”)
* `as T` (“hey compiler, this is `T`”) (NB: it is not casting!)
 
# Where Typescript is useful
 
If you build an SDK or library used by other applications, types are useful to define clear contracts between APIs and consumers.
In addition, during refactoring, types can help you understand the consequences of a change.
 
Some types, common in functional programming languages, can help in everyday programming situations. For example,
 
* `Option<T>` instead of `null` or `undefined` is better to describe a case when a function could return no value.
* `Either<T, U>` can replace `try-catch` blocks, which are usually hard to debug.
* `Task<T>` describes asynchronous computation and replaces `Promises`.
 
For Typescript, [fp-ts](https://github.com/gcanti/fp-ts) is a very nice library that implements those types.
 
The considerations above are generic and not specific to Typescript. Typescript has also a couple of nice features that are worth mentioning.
 
Using [mapped types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types) it is possible to define complex type constraints.
For example, let us assume you want to implement a database of superheroes. Each hero has a list of super skills. For example,
Superman has `flying` and `superStrength`, Aquamen has `fishTalking` and Batman has nothing. You can define a generic interface `Hero` where the skill set depends on a generic that defines which kind of hero the interface represents. For example, if `bruce` is a `Batman` hero, then Typescript knows that he cannot fly!
 
```typescript
interface Skills {
   Batman: {};
   Superman: {
       flying: true;
       superStrength: true;
   };
   Aquaman:{
       fishTalking: true;
   }
}
 
interface Hero<T extends keyof Skills> {
   skills: Skills[T];
}
 
const clark: Hero<'Superman'> = ...;
const bruce: Hero<'Batman'> = ...;
 
clark.skills.flying; // correct!
bruce.skills.flying; // type error!
```
 
You can use this trick to document your code. I think that it is impossible to express this kind of constraints in `jsDoc`.
 
Type level operations are powerful in Typescript. Indeed, its type system is Turing complete. Look at [this project](https://github.com/tycho01/typical) for some very impressive examples.
 
I do not think that our goal is to type as much as we can. Typescript offers us a great flexibility and expressivity. It is up to us to decide how much typing we need. In the superheroes example, we can decide to define `Hero.skills` as a simple object. In this case, the compiler cannot help us to understand when, by mistake, we try to make `bruce` fly. I am not sure that `bruce` would agree, but it is fine. It is up to us to understand from the context what is more important: safety or productivity.
 
# When Typescript
 
Typescript lets us decide what, if and how to type. As a general rule, I would say that we need to type at least the boundaries.
The boundaries are the interfaces with the external world.
 
If a function is designed to be consumed by 3rd parties, it is better to type its arguments and return value.
 
If we use higher order components to compose functions, the units of composition and the combinators should be typed.
In this way, Typescript helps us to compose things in a meaningful way.
 
Finally, we can use Typescript to follow a type-define-refine approach as proposed by [Edwin Brady](https://www.manning.com/books/type-driven-development-with-idris) for Idris.
 
* First, create a **type** describing what you want to achieve.
 
```typescript
const getFirstCommand: (input: Input) => Command = {} as any
```
 
* Then **define** a tentative implementation.
 
```typescript
const getFirstCommand: (input: Input) => Command =
 input => input.payload.commands[0]; // type error command can be undefined
```
 
* Finally, **refine** your implementation until type errors are resolved.
 
```typescript
const getFirstCommand: (input: Input) => Command =
 input => input.payload.commands ? input.payload.commands[0] : [];
```
 
# Where Typescript is bad
 
Typescript is not the best programming language in the world. Other programming languages and different type systems could be more suitable in other contexts.
 
There are several things of Typescript I do not like.
 
For example, type errors look scary. In theory, Typescript team is working on a better notation. However, at the moment,
error messages are quite long. Despite of that, they are very informative. If you read them carefully, you should be able to fix them easily.
 
Type level operations can be complicated and hacky. In real life, though, you can learn just the most common tricks, like mapped types.
Even if it is interesting theoretically, you don't really need to implement [Turing machines](https://github.com/Microsoft/TypeScript/issues/14833) with Typescript types in your daily programming job.
 
Finally, Typescript is Javascript. You must know Javascript (and its oddities) to understand Typescript.
 
# Conclusions
 
* Types do not have thaumaturgical qualities, they are just a tool.
* There aren't typeless and typeful languages, but many type systems.
* Imo Typescript type system is lightweight, flexible and hackable.
* Typescript has some useful features that help us in everyday programming.
* We should not type as much as we can. It is more important to type the boundaries.
* Typescript is not perfect.

