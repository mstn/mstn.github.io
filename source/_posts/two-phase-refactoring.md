---
title: Two phase refactoring
date: 2019-02-24 09:00:00
tags:
- web
- rails
- vue
- refactoring
- jquery
---

Front end development has been changed a lot in the past decade.

Not only frameworks have changed. The Web itself is now a very different place respect to ten years ago. Browsers are more powerful, we can compute a lot of stuff on the client side. Mobile is a reality. Users expect more advanced fluid interactions with web applications.

Nevertheless, many existing web applications are still tightly bound to old technologies and approaches, in particular on the client side. 

Upgrading your stack is not just a matter to follow the current hype. A modern technology can give also real benefits. In particular, it could impact on user satisfaction, performances, conversion rates and Google ranking. This means more profits and more money for many companies.

The engineering saying "if it works, don't change it" is probably the main reason to resist to change. Indeed, the cost of a full rewrite is too high and too risky. For example, many business rules are wired into the legacy code. Moreover, we should understand how to leverage the existing assets and team expertise/skill sets more than distrupting the current state of things.

Hence, when we approach a legacy system to introduce a new technology, we need to incrementally refactor the existing code base. In a first phase, we need to prepare the code base to change and, only after that, we can apply changes. I call this process "two-phase refactoring".

In the rest of this post, I will discuss what two-phase refactoring is with some examples from a project I have worked on lately. We discuss a case study where we want to migrate a legacy Rails app to Vue on the client side. We show how Vue can be adopted incrementally and how it can be a good fit for a two-phase refactoring.

# Two Phase Refactoring

Martin Folwer, in his famous book [1], defines refactoring as a process where code is changed in small steps that leave functionalities unchanged. He focuses on the description of syntactic techninques, which should help to indentify and reduce bad smells, that is, possibly problematic pieces of code.

While introducing a new technology, the techniques we need to apply are similar to Fowler's ones. However, we are not simply transforming the existing code base to improve some code metric. We are replacing part of the stack with another one. New technologies can be foundamentally different in many different aspects. For example, `jQuery` is imperative while `Vue` is declarative and compositional. 

Hence, introducing a new technology is harder than traditional refactoring.

A new technology cannot be just dropped there. Migration should be approached in two ideal phases.

The first phase of refactoring consists of reorganizing the code, without altering functionalities, in such a way to make the transition possible. The second phase is implementing the transition.

For example, consider the scenario where server interactions are handled by functions bound to html events (e.g. `<a onClick=...>`) and implemented with `jQuery.ajax` calls. In order to decouple presentation from network layer and model, we want to bind "actions" to dom and delegate the actual communication to another component.  We would like to get rid of `jQuery`, too. There are faster alternatives with smaller footprints. However, the legacy code might be very entangled with `jQuery` and so we cannot remove it in a small simple step. What we can do is to extract and move the `jQuery` logic to some methods (like in Fowler's "extract method" technique). We do not change the underlying communication mechanism, but the first refactoring step enables us to prepare the code for a better solution.

# Refactoring and tests

Solid tests are a pre-requisite for any sort of refactoring. However, a good test suite is not enough when we migrate to a new technology. Even when feature test coverage is good, every change should be pass through (manual) QA. 

For example, in the example above, if we remove `jQuery` in one shot, several features are affected at the same time. Instead, if we firstly extract methods, we can pass changes through QA because they are feature based.

# When/what you should not refactor

There is no need to refactor all the legacy code. We do not want to change things that has been worked for a so long time. Old and new technologies can often co-exist without too much overhead. Thus, when it is possible, we can leave the legacy code untouched.

# A case study

This case study is based on some real working experience.

Assume we want to refactor a webshop visited by thousands of users. The stack is Ruby on Rails with some unstructured jQuery on the client side. 

We do not want to rewrite the whole application. It is too impractical since the code base is very large. Moreover, the team has a great expertise in Rails programming. So we want to leverage the existing assets more than turning the app upside down.

The main problem is to avoid business logic duplication. Business logic is codified on the server side. We do not want to duplicate logic on the client because it would be hard to maintain. In addition many business rules are tacit and encoded in software. 

Since the team has developed a lot of expertise with Rails rendering, we stick to Rails as a rendering engine. We want to render HTML on the server, mainly for SEO reasons. However, although Rails can render Vue components on server side (e.g. [vueport](https://github.com/samtgarson/vueport)), it does not make sense to ask the team to learn something different.  

Finally, we want to adopt Vue incrementally. Vue and the legacy Javascript code should co-exist for a while. The main reason is that we want to release new features implemented with Vue as soon as possible. We do not want to wait to replace the legacy code with something else before publishing the outcome of the refactoring. 

## Vue vs React vs Something else

The choice of Vue is made after some considerations. To sum up, Vue seems more flexible than its direct competitor, that is, React. 

We need to bind components to pre-rendered DOMs. It is easier to bind Vue components to existing DOM elements. React-based alternatives are [not robust enough](https://github.com/facebook/react/issues/7712#issuecomment-360599550).

We do not have to stick to a single template language, i.e. JSX. Although it is possible to use [React without JSX](https://reactjs.org/docs/react-without-jsx.html), Vue is much more flexible and easy to use with different template languages.

We could have considered other technologies, such as [stimulus.js](https://github.com/stimulusjs/stimulus). Stimulus is quite popular in Rails community and it is a good tool. Nevertheless, we opt for Vue because it should scale better for larger projects. We do not want only to make some html smarter, but also to implement some serious inter-component communication. Vue seems more mature and complete on this front.

## Vue instances

In order to reduce the risk of breaking things, we want to start Vue only when is strictly necessary. Vue instances could be a way to restrict and control which regions are affected by the refactoring.

The first phase of refactoring consists of identifying which regions we are going to change. In the second phase, we can move towards a single Vue instance for the whole application, as it is common. However, having - firstly - more instances allow us to disable Vue for page sections without Vue templates.

For example, a legacy carousel component has problems with Vue because of some embedded Javascript code. Carousel instances are ubiquitous in the web application. We build a Vue version of the carousel component and we enable it page by page after careful testing.

## Inline templates

In order to keep rendering performed by Ruby on server, we use `inline-template`s and attach logic to existing html with Vue.

In this way, we can use `props` to pass data from Ruby to Javascript (a well-known technique) and still use Ruby for `i18n`, rendering and business logic.

We know that `inline-template`s could have [some parsing caveats](https://vuejs.org/v2/guide/components.html#DOM-Template-Parsing-Caveats). Thus, `inline-template` are not the best solution.

However, the legacy app is not organized in components. With `inline-template`, we can start to identify some common html patterns as component candidates. So marking existing html with `inline-template` could be the first step in a two-step refactoring that enables the migration toward a more compositional UI architecture.

## Vue components as jQuery wrappers

We can wrap existing `jQuery` into Vue components. There is no need to rewrite `jQuery` logic from scratch in the first phase. However, we can isolate `jQuery` in Vue lifecycles. For example, let us assume we have a phone number validator base on `jquery.validate`. In the long term, we want to get rid of `jquery.validate` and the phone validation library. However, for now we need to keep them.

The first phase is to isolate this legacy code in a Vue component, let's say, `<with-legacy-phone-validation/>`. The new component lifecycle methods bind and unbind jQuery events (see for example [this tutorial](https://www.smashingmagazine.com/2018/02/jquery-vue-javascript/)). The old code can be copied "almost" verbatim. 

In this way, we have identified which parts are affected by the old validation. It would be easier to remove `jquery.validate` in a second phase.

## VueX

In order to avoid business logic duplication, the client state should be created and updated by the server following business rules. In this way, the client does not have to know any business logic.

Since we need a global state on the client, VueX is the most natural tool to choose to handle client state.

Another benefit of VueX is the possibility to pre-fetch client state. In other words, a `script` tag with some `json` is injected in the body of an html page. Some javascript fetches this `json` and initializes the state.

The technique is often used to save a client-server round trip and for server side rendering. In this context, it is used also as another way to pass information from Ruby to Javascript without using `props`. 

Passing data via `props` is simple and is the right things to do in many cases. However, it is not suitable if data are not just string, but have types like `json` or `number`. In this case a component should parse the data and it could be quite cumbersome to see.

## Listening to DOM changes

The legacy code can change DOM in two ways. The first one is using `jQuery`, but this usually works quite well with Vue. The second is through server responses. 

For historical reasons, dynamic client behavior is implemented with server ajax calls returning a javascript code to be executed on the client. For example, when an item is added to basket, the server returns some javascript to update the basket counter.

Of course, this technique is not very nice because it violates the "separation of concerns" principle. As part of the refactoring we want to move from this approach to a more clean data-only API way. However, since we want to adopt Vue incrementally, we have to cope with this.

The main problem is that javascript updates could destroy Vue instances. The solution is to listen to dom changes and recreate Vue instances if they are destroyed. Technically, we use the [W3C Mutation API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), which are supported by all browsers today.

The limitation of this approach is that it does not work for arbitrary dom changes. For example, a Javascript update could destroy the DOM listener! So we must hope that the Rails app is designed in a smart way so that Javascript updates always and only occur for the same portion of the HTML page.

# Conclusion

Introducing a new technology in a legacy app is challenging. The new technology cannot be just dropped into the existing code. 

We should approach refactoring in two macro phases. First, we need to prepare the code to migration and then implement the migration. The first phases should consist of small QAable/feature based steps.

We discussed some examples from a case study where we want to add Vue to a legacy Rails app. 

Vue is good for this end since it can be incrementally adopted and fits well into a two-phase refactoring.

# Acknowledgements

Many thanks to the team at [Purepoint](https://purepoint.io/). I learnt a lot from discussions and criticisms. This blog post has been adapted from some internal documents I prepared. 

# References

[1] Martin Fowler, Refactoring: Improving the Design of Existing Code, 1999

