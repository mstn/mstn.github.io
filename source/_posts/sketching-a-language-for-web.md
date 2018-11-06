---
title: Sketching a language for Web Programming
date: 2018-11-06 09:00:00
mathjax: true
katex: true
tags:
- web
- react
- vue
- bigraphs
- signal flow graphs
- category theory
---

In this post I want to talk about a language for representing user interfaces and their dynamics.
At the moment, the language is only sketched and I would like to present the basic idea even if it is nothing but an idea.

My background is from React and Vue. So this post is influenced by them, in a positive and in a negative way. I do not know Elm, but I feel there are some similarities with what I am writing here, in particular the idea of decoupling views from updates. 

The brief summary outlined below does not pretend to be complete nor accurate. Rather, I want to highlight the main points I would like to tackle with my language proposal.

# An opinionated inaccurate view

Over the past years several frameworks and programming paradigms have been emerged to build Web applications. 
These approaches can be very different, but they have some elements in common. Of course, reality is more complex than this summary. For example, I do not consider React Context API. However, I am not going to make a detailed comparison among different frameworks. 

## Component = rendering unit + bindings + lifecycle

Components are the main unit. They define how to render a bit of user interface (view) from a state and bind dom events and elements (in a Babel of different syntaxes and semantics). Usually, components have a life-cycle (e.g. mount, destroy), can be composed and allow some form of child-parent communication (e.g. props, events).

## Views are defined in a declarative way

Views are usually defined in a declarative way. Programmers do not have to take care about how a page is rendered; this is different from previous approaches (e.g. Backbone) where programmers had to implement the actual rendering algorithm. There are at least two declarative approaches. The first one is based on templating languages that extend HTML syntax (e.g. handlebars) with some control statements (e.g. if, for each). In the other approach, views are defined in a native language with some primitives or functions to represent HTML tags (e.g. JSX is Javascript extended with HTML-like tags).

## Inter-component communication

Historically, components lacked tools for complex inter-component communication. For this reason, several paradigms have popped up. For example, [Flux](https://facebook.github.io/flux/docs/overview.html) is a design pattern used in many libraries, e.g. Redux. Basically, an application has a global state as a unique source of truth. Individual components map the state to views and interact with the global state sending actions/events that mutate the original state.

# A more abstract approach

I want to adopt a more abstract point of view independent from the actual implementation. 

First, I want to represent views with a high level data structure. For example, a view is a tree, which is part of a bigger tree we call dom; I do not care if this tree is described using templates or JSX or pure functions, how elements are bound to state or which particular algorithm I use to update the actual dom in my browser.

Then I want to abstract away from the underlying communication mechanisms and architectures. We want to describe what changes (e.g. data dependencies), not how (e.g. actions and mutations).

Finally, dom and state must be separated and, above all, independent.

The last point is inspired by bigraph theory [1]. Bigraphs are a formalism to model space and motion. I wrote a short introduction [here](https://mstn.github.io/2018/09/08/milner-bigraphs-matrices/). The underlying insight is that space and motion should be modeled by independent data structures. 

In an analogous way, we might think of a web application as a spatial part (dom) plus a dynamic part (communication). These parts are logically independent. For example, I should be able to click on an "add to basket" button and see the navbar basket updated regardless on where the button and the basket are located in the user interface.

As a consequence, we do not need any special device for child-parent comunication. There is only one uniform communication mechanism independent from the dom hierarchy.

Another aspect is state. In modern web development state is seen with suspect. We are told to avoid side effects and there are good reasons to follow this generic advice. However, I think, the problem is not state in itself, rather, the lack of compositionality of states. React and Vue are good tools to compose user interfaces (i.e. doms), but, in my opinion, they lack compositionality mechanisms for state (maybe Context API could change this).

In the rest of this post, I will sketch an operational semantics and I will borrow several ideas from the operational semantics for signal flow graphs [2]. Please bear in mind that many important details are omitted and I am not giving a full working set of operational rules. All of this is very work in progress. My main goal is to communicate the informal intuition to the average programmer who does not know anything about operational semantics and category theory.

# Abstract dom

An abstract dom is a representation of possible dom states. We prefer the term abstract dom, because virtual dom is quite overloaded at the moment.

An abstract dom is defined by three elements,

* Nodes
* IF Nodes
* EACH Nodes

Nodes are standard and custom dom element such as `div`, `span` and so forth. IFs and EACHs are control nodes for conditional and iterative rendering, respectively.

In other words, an abstract dom is a dom with some extra features. We could add recursion and other fancy stuff to the list of extra features, but, for now, we prefer to keep it simple. In practice, we define templates or jsx with IFs and EACHs. Rarely, we need more power. However, this is not a good reason to not add more power.

A node has some ports and an inner state. Ports are like arguments of a function (even if their relation is not necessarily functional). Inner state is the state of the node. For example, a button can be `pressed` or `unpressed` or an `li` element can be parameterized by its position $i$ within a list.

The behavior of individual nodes is defined by a set of rules. A rule is a labelled transition of the form $t \overset{l}{\rightarrow} t'$ where $t$ is the redex, $t'$ is the reductum and $l$ is a label.

For example, consider we want to define the behavior of a button. In the picture below we define a node for the button element and two rules that simulate the click event in HTML.

![](/images/web/rules-for-button-and-composition.png)

A button is represented as a box with the name of the tag (i.e. `button`) and an inner state (i.e. `pressed` or `unpressed`). A button has two ports. Intuitively, one listens to dom events while the other is an event handler. We label ports with numbers in order to distinguish them.

A transition label is not a single symbol, but a set of symbols corresponding to the possible values on ports. Instead of adding labels on the top of arrows, we put labels on redexes. Not all ports must have a value in a transition and the assignment is not necessarily functional nor deterministic.

The first rule `R_BTN_CLICK` says that, if a button is `unpressed`, when it gets a click event on port 2, then it changes its state to `pressed`.

Instead, if the button is already `pressed` and port 2 does not have any click event (e.g. user has released the button), then the button state gets `unpressed` again and a 1 is emitted on port 1. This is rule `R_BTN_RELEASED`.

As for bigraphs, nodes can be nested. On the right hand side of the picture above, our button is inserted into a `div` element and has a sibling `span` node. Note that port links are independent on the dom hierarchy and cross the boundaries of the parent element.

Control nodes are like dom nodes but with special rules. Let's start with IF.

![](/images/web/if-rule.png)

On the right, we represent the IF node while the two IF rules are on the left. A IF node is a box (we use thicker borders to denote control nodes), with a port (the IF condition) and two holes. As we will see later, every node can have holes that can be filled by other nodes (again, this is from bigraph theory). We use dashed boxes to denote not active areas. Intuitively, a sub-tree within a dashed box is not displayed and its connections are not active. In the case of IF nodes, hole 0 is the "then" branch while hole 1 is the "else" branch. The two rules are called `R_IF_FALSE` and `R_IF_TRUE`, respectively, and are fairly trivial.

# State

We denote a state as a node with some ports and a value. State ports have a different color (i.e. red) because we want nodes communication to be mediated by state. In other words, we do not want to connect two dom nodes directly. However, I am not sure about this choice (which is influenced by the use of edges in bigraphs) and it could change in the future.

A state is not just a value container. It is a value plus some rules to mutate this value. For example, the following picture shows some examples of state and state rules.

![](/images/web/state-examples.png)

Rules can leave the state unchanged like in `lt` (`R_LT2_TRUE` and `R_LT2_FALSE`) or `filter` (`R_FILTER`) or change the state like in `inc` (`R_INC`). `R_INC` increases the stored state by one. `R_LT2_TRUE` and `R_LT2_FALSE` check if a value is less than 2 and return `true` or `false`, respectively. `R_FILTER` allows only some values to pass, in this case, only values equals to the state.

# A counter example

Now we are going to put together the building blocks described in previous section. We are going to build a simple counter that shows the number of button clicks and, if this number is greater than or equal to 2, the counter explodes.

## The Counter

![](/images/web/counter.png)

The picture above represents our counter. We need two states for increasing the counter value and checking if the count has breached the threshold. Box nesting resembles the structure of the HTML page very closely.

## First click on button

![](/images/web/counter-steps-1-2.png)

Here, we show the transitions triggered when user clicks on the button once. The first transition is the application of the rule `R_BTN_CLICK`: when user clicks, the button state is changed to `pressed` and that is it. Here and in what follows, we mark red the parts changed in a transition.

The second transition is more interesting. When button has state `pressed`, the only possible rule we might possibly apply is `R_BTN_RELEASED`. However, we need to check if we can apply this rule in a consistent way with other rules. In particular, button port `1` (right-bottom)  has label `1`. This label is shared with `inc` state and `R_BTN_RELEASED` can be applied only if we can apply a rule for `inc` where port label is also `1`.

In this case, the rule is `R_INC` and we can follow the same reasoning for `lt2` and apply rule `R_LT2_TRUE`.

Again, this is just the basic idea. Several details must be clarified or fixed. We would like define a composition mechanism for individual rules with a sort of operational semantics in the fashion of [2].

## Second click on button

![](/images/web/counter-steps-3-4.png)

Then user can click on button once more. The first transition is the same as before. The second transition triggers `R_IF_FALSE`. So abstract dom changes, the `then`-branch is disabled and the text `BUM!` is displayed.

Note that here we are overlooking several important details. For example, we should specify better what we mean when a dom region is disabled and how the corresponding "links" can be disabled, too (e.g. it should not be possible to click on the button again).

# Coming soon

In some next post, we will add more details. In particular, I want to show:

* Each rules: some nodes can be rendered iteratively and dynamically. Think about `li` elements in a `ul` list.
* Composition: states and doms can be glued together. Building blocks are components, a mix of doms and states.
* A TODO app: a more complex example to show how to build something real (or almost real).

# Credits

Diagrams in this post are created using [Mathcha](https://www.mathcha.io).

# References

[1] Robin Milner. The space and motion of communicating agents. Cambridge University Press, 2009.

[2] F. Bonchi, P. Sobocinski, and F. Zanasi. Full abstraction for signal flow graphs. ACM SIGPLAN Notices. Vol. 50. No. 1. ACM, 2015.
