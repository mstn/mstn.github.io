---
title: On Order in Distributed Systems
date: 2022-07-26 09:00:00
mathjax: true
katex: true
tags:
- order
- software engineering
- distributed systems
- kafka
- crdt
- azure durable functions
- temporal
- architecture design
---

Distributed systems are fundamentally different from single threaded/single computer systems. For example, while a good test coverage can make us _reasonably_ confident that a single computer system works as expected in the wild, that is not true anymore in a distributed context. Things can go wrong in new and unexpected ways that are hard to foretell and reproduce. If you are interested in this topic, I'd recommend Chapter 8 of [1].
 
Speaking of _event driven architectures_ [3], partial failures or queue congestion may delay or restrain the delivery of an event. Thus, events may be received by handlers when they are not expected. In addition, to make the system more robust in response to failures, events are often retried and, for this reason, may be received multiple times.
 
Without any ordering guarantee, writing code for event handlers is, in general, not simple.
 
You often read suggestions like "Write code without making assumptions about order". Yes, that sounds like a piece of advice, but... how? In everyday work, I fear that the advice is simply interpreted as "ignore the order problem". Concurrency problems that arise from out-of-order events are often swept under the rug: they are rare now, so I don't care. Also earthquakes are rare, but this is not a good excuse for not buiding foundations for houses. Besides, concurrency problems become more frequent when a system scales. In this case, what used to work starts to fail in unexpected ways that are hard to reproduce and debug.

Events represent causality and preserving causality is important for the integrity of the system.

Actually, it is desirable to liberate programmers from the burden of thinking about event order. It would be nice if we could write code without making assumptions on order. However, the underlying system or architecture should be designed in such a way that our code can be order agnostic.
 
How is it possible to build a system in such a way that application code can be order agnostic? In this post, we will discuss three different examples of technologies (Kafka, crdt and replay-based workflows) that allow us to write code without worrying about event order in business logic. In every case this is achieved without the need of a central coordinator. Another trait in common is that order doesn't disappear from the system, but changes only form.
 
Even if you don't know it, you always make implicit assumptions about order when you build microservices or any other distributed system.
 
## Do nothing
 
Let's assume that the current state of a service was computed without taking into account a past event that wasn't received in the "right" order. Martin Fowler calls this kind of event "retroevents" and writes about possible solutions to this problem in an old post [2]. Fowler's proposal boils down to replay all the events including the missed one in order to rebuild an updated corrected state. He seems to admit that this strategy offers some challenges in the implementation. We will come back to it later. For now, just assume we received an out-of-order event. What if we do the simplest thing we can do, that is, nothing? What does it mean? What is the cost of doing nothing?
 
If we do nothing, the whole system may end up in an inconsistent state. Suppose that the event is about a money transaction, the audit service and the balance service may disagree on the amount of money on our bank account. This is not what we want!
 
A simple solution could be to add a timestamp to both the service state and the events. Then we can update the service state only when we receive an event "fresher" than the current state. Of course, we are assuming that we can trust clocks and timestamps (see [8] to see why we shouldn't), but it could be a good enough solution in many cases.
 
There are cases when timestamps won't work. For example, let's assume that a service implements a sort of state machine. Given a state and an event, a transition to another state is triggered. If an event is received and is not what, given the current state, we expect, what should we do? Discarding or ignoring the event can lead to some information loss (perhaps the event is expected later). We can reject the event and fail the process computed by the underlying state machine. The latter strategy is better because we handle the anomalous case and users can retry the process again. However, this works if out-of-order events are rare and occasional hiccups of the system can be tolerated. In this case, **failing early is good for user experience, but the system is not fault tolerant** because a single fault (out of order event) causes a full failure of the system (more about the difference between faults and failures in [1], chapter 1).
 
To sum up, doing nothing can be a valid option if we are able to guarantee no system state inconsistency. Otherwise, we should at least fail early if full failures are acceptable. However, in the best case, the system won't be fault tolerant.
 
## The anatomy of a service
 
In an event-driven system, a service consists of a queue, a local state and a function computing some business logic. Modern approaches to solve the order problem in distributed systems enforce an order in one of these components: upstream in the queue, downstream in the state, and in the middle in how the code is executed.
 
Upstream, Kafka is designed in such a way that an event partition can be consumed only by a single worker. In this way, this particular architectural choice guarantees that events from the same partition are consumed in an ordered manner.
 
Downstream, CRDT technique structures the state space in a lattice in such a way that we can update the current state with the information provided by events without worrying about order. As we will see, while CRDT in general is not trivial, in practice we use CRDT without knowing it when we use timestamps to update a state. Even if we are not aware of it, when we build microservices, we often implicitly assume an order in the state space.
 
In the middle, code executions can be ordered as well. This is the basic idea behind new technologies such as Temporal or Azure Durable Functions. Basically, code can be _partially_ executed and the space of partial executions is ordered in an obvious way.
 
## Enforcing event ordering by design
 
Assuming that events are ingested into a queue in the right order, how can we be sure that we can read them first in first out? Let's consider a traditional message broker, such as RabbitMQ [8].
 
Typically, more consumers can read concurrently from the same queue. This means that one event is eventually delivered to one consumer, but more consumers are competing for the same event. Under the hood, a "delivered" event is not actually removed from the queue, but becomes invisible for a time window. When a consumer acknowledges that the event has been processed successfully, then it is removed from the queue. The reason is that, if a consumer crashes, we want to be able to retry the event with another consumer.
 
Well, in this case, we cannot guarantee that events are processed in the order they entered the queue. For example, let's assume we have those events `C > B > A`, `A` is processed by `worker1` and `B` is processed by `worker2`, then `worker2` finishes with `B` and `worker1` crashes, `worker2` will process `A` after `B`.
 
Tools like Kafka [9] have been designed to enforce the delivery of events in the right order. The problem is solved at the architectural level in an efficient way and without the need of coordinators.

In Kafka, events are partitioned. A consumer can read by one or more partitions _in an exclusive way_. This means that **a partition is consumed only by one consumer** (to be precise, within a worker group). As a consequence, the next event can be processed only if the consumer has done with the previous one. in this way events cannot be put back into the queue causing the ordering problem we illustrated earlier: **the architecture enforces the order in which events are delivered and processed**. The drawback is that, within a single partition, there is no concurrency, but, with multiple partitions and an even distribution of events, a system can scale out easily.

Note: the pattern single-consumer-single-partition solves the problem of order, but still events can be delivered more than once. Kafka implements some mechanisms for exactly one semantics, but this topic is out of the scope of this post.
 
Food for thought. AWS SQS queues are based on a visibility window, so they behave in a similar way as RabbitMQ for failure management. Thus, order cannot be guaranteed. AWS also offers FIFO SQS where the order is guaranteed. How is that possible? Hint: read the documentation or email me to discuss.
 
Food for thought. Kinesis sounds like an AWS rebranding of Kafka (maybe not, but they share many details). Since lambda functions can consume Kinesis streams, how can we reconcile the infinite scalability of Lambda functions with the one-partition-one-consumer paradigm of Kafka? Can more instances of the same lambda consume the same stream? Hint: read the documentation or email me to discuss.
 
## Ordering the space of possible states
 
In the previous section, we saw how we can force an order to incoming events. There are other strategies that enforce an order downstream. Let's assume that a service can receive events in any order, can we guarantee that the resulting state is meaningful?
 
We have already seen something similar when we decided to make the events with the latest timestamp win. For example, if an endpoint receives events for changing the status of an account, we say that we keep the internal state of the service updated with the freshest information we have collected so far. This algorithm is an example of a more general approach which is called Conflict Free Replicated Data Type or CRDT [4].
 
Explaining CRDT is out of the scope of this post. Oversimplifying a lot, the basic idea is that a service state can take values from a data type that is a partial order equipped with a least upper bound $\sqcup$. 

For example, let's say that the state has type $\\{ name: String, surname: String \\}$; this type forms a partial order $\bot \leq \\{ name: String \\}$, $\bot \leq \\{ surname: String \\}$, $\\{ name: String \\}, \\{ surname: String \\} \leq \\{ name: String, surname: String \\}$ where $\bot$ denotes the `unknown` type. Events notify that name or surname have changed. 

If the current state is $x$ and an event $y$ is received, then the updated state will be $x \sqcup y$. For example if $x$ is $\bot$ and we receive $\\{ name: John \\}$, then the new state is $\\{ name: John \\}$. If then we receive $\\{ surname: Doe \\}$, the new state is a merge of $\\{ name: John \\}$ and $\\{ surname: Doe \\}$ (i.e. $\sqcup$), that is, $\\{ name: John, surname: Doe \\}$.

Since $\sqcup$ is defined to be commutative, idempotent, and associative, the order of events doesn't really matter: we can receive $x$ before or after $y$, but the final merged state will be always the same, i.e. $x \sqcup y = y \sqcup x$. For example, if we receive $\\{ surname: Doe \\}$ _before_ $\\{ name: John \\}$, the final result will be, again, $\\{ name: John, surname: Doe \\}$.

Using CRDT we don't worry about the order of events. Of course, the major drawback is that we need to design our downstream data model in such a way that the properties of CRDT hold, which is not always trivial.

Food for thought. What if we receive duplicate events such as $\\{ name: John \\}$, $\\{ name: John \\}$? What if values are different, for example $\\{ name: John \\}$, $\\{ name: Marco \\}$. I told you: the above explaination is an oversimplification! Hint: email me to discuss.
 
## Replay the tape one more time
 
Remember Martin Fowler's idea of replaying the events and building a corrected state? Well, this is basically the idea behind some new technologies such as Azure Durable Functions [5,6] and Temporal [7]. 
 
While the previous approaches define an order for events and states, in this case the order is defined over the space of possible computations! How? Let's see with a simple example.
 
Let's assume we want to compute a function `f` with some side effects that we call _activities_. Just to keep the formalism simple and show the basic idea, we represent `f` state as an array where `i` is the `i`-th activity. For example, the state $[a, \bot ]$ means that activity `1` has returned value `a` while activity `2` has not returned a value yet.

When `f` starts executing a new activity `a`, it sends a request to an external service and then suspends itself. When the external service computes `a` and returns a result, `f` is resumed.

As you can see, `f` is run several times. A possible "trace" of a `f` computation is:

1. first run `f` with the empty state $[ \bot, \bot, \ldots ]$. Activity `1` is triggered and `f` is suspended.
2. when activity `1` returns `a`, then run `f` with $[a, \bot, \ldots ]$.  Activity `2` is triggered and `f` is suspended.
3. when activity `2` returns `b`, then run `f` with $[a, b, \ldots]$ and so on!
 
The set of run states is clearly partially ordered. E.g. $[\bot, \bot, \bot] \leq [a, \bot, \bot] \leq [a, \bot, c] \leq [a, b, c]$, but $[a, \bot, \bot] \not \leq [\bot, b, \bot]$ and $[\bot, b, \bot] \not \leq [a, \bot, \bot]$.
 
Both Azure and Temporal documentations say that functions of this kind are "deterministic". In my opinion, the right word is monotonic. At each rerun of a function, one or more completed steps are added to the previous ones (that is what monotonic means). In this way, we can order those partial computations. The least upper bound of the set of all the partial runs is what the function computes. The function is deterministic precisely because the least upper bound of its partial computations exists and is unique, as it can be proved with some basic theory on continuity [10].

Functions like `f` are sometimes called replay-based workflow. It is a quite powerful idea: workflows are fault tolerant because they can rerun after crashes and developers can write code without worrying about duplicate events. 

What about out-of-order events, which is actually the topic of this post?

Well, for simplicity's sake, let's assume that there is only one event `ReturnResult i a` when activity `i` is completed with value `a`. If activities are executed in sequence, namely one after the other, then an out of order event can only be a duplicate event: the event has already been applied to the workflow state and the duplicate can be just ignored. In general, this is the most common case because in a workflow next activities depend on the previous ones, we cannot send a request for the next activity if the previous one has not returned. 

However, for efficiency, we can send requests for future activities if they don't depend on previous ones. In this way when a future activity is actually invoked, we know its value in advance and don't have to send a request over the network. In this scenario, if we receive a value for a future activity, we can just store it. Let's suppose that the current state is $[\bot, \bot, \bot]$ and that `2` depends on `1`, but `3` is independent. We can send a request for `1` and `3`. If `3` comes back first, then we update the state $[\bot, \bot, c]$. Finally, when `1` returns, the state becomes $[a, \bot, c]$. We obtain the same result also if the order of events is different.
 
Partial executions and event sourcing are clearly related. For example, [5] prove that an abstract computational model for Azure Durable Functions is indistinguishable (i.e. bisimilar) from a more concrete model where "partial executions" are replaced by event sourcing.
 
Under the hood, Azure Durable Functions and Temporal implement event sourcing patterns, so their inner machinery is not much different from what we could have done with Kafka or other techniques. The main benefit is that developers don't have to know anything about event sourcing, which can become complex soon.

Food for thought. I realize that this section is full of hand waving arguments, but I think the core idea is correct. Are you able to build a more formal argument based on the idea of monoticity and continuity? If you are interested, get in touch!

Foor for thought. We discussed duplicate events and out of order events. What about inconsistent events? For example, we may receive two events for the same activity: `ReturnResult i a1` and `ReturnResult i a2` with `a1` different from `a2`. When can it happen? Should the workflow fail with a system failure or can we ignore one of the two events or what else? Hint: there isn't a single answer, email me to discuss.
 
## Conclusion
 
In event-driven architectures, event ordering is important because it reflects causality and has consequences for the integrity of the system.
 
Unfortunately, developers pay little attention to the order of events when they build systems. Often, you hear the advice "don't make assumptions about the event order". Here, I argue that we should instead make the ordering assumptions explicit because, even when we don't think about them, our systems are designed around some idea of order.
 
We showed how three very different modern technologies solve the problem of order in a distributed context. 

|              | what is ordered  | how order problem is solved   |
|--------------|--------------------|--------------------|
| kafka        | queue/consumer  |events are consumed only by a single worker within a partition |
| crdt         | state  | data states are a partial order with lub  |
| workflows | executions | workflow run states are a partial order   |

 
My claim is that the order problem is not magically eliminated, but simply changes form. Developers can be liberated from thinking about order because the system is designed in a particular way. 

So, in conclusion, be careful: if you don't think about order, order will think about you.

## References

1. Kleppmann, Martin. Designing data-intensive applications: The big ideas behind reliable, scalable, and maintainable systems. O'Reilly Media, 2017.
2. Martin Fowler, Retroactive Event, 2005 [link](https://martinfowler.com/eaaDev/RetroactiveEvent.html)
3. [Event-Driven Architecture](https://en.wikipedia.org/wiki/Event-driven_architecture)
4. Shapiro, Marc, et al. A comprehensive study of convergent and commutative replicated data types. Diss. Inria–Centre Paris-Rocquencourt; INRIA, 2011.
5. Burckhardt, Sebastian, et al. "Durable functions: semantics for stateful serverless." Proceedings of the ACM on Programming Languages 5.OOPSLA (2021): 1-27
6. [Azure Durable Functions](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview)
7. [Temporal](https://docs.temporal.io/docs/concepts/introduction)
8. [RabbitMQ](https://www.rabbitmq.com/)
9. [Kafka](https://kafka.apache.org/)
10. Glynn Winskell, The Formal Semantics of Programming Languages, 1993

