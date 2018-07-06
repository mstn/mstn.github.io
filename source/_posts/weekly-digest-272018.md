---
title: Weekly digest (week 27-2018)
date: 2018-07-06 09:00:00
tags:
- performance
- graphql
- logging
- trains
- react
---

* [High Speed Trains are killing the European railway network](http://www.lowtechmagazine.com/2013/12/high-speed-trains-are-killing-the-european-railway-network.html) (2013). The author shows that saved travelling time is not much compared to increased ticket prices. In addition, even if trains are actually a more sustainable alternative to air traffic, the high cost of high speed train tickets forced more people to choose cheap but polluting flights over trains. Hence, the overall effect of high speed trains on the environment is negative. Wu Ming 1 from [Wu Ming collective](https://en.wikipedia.org/wiki/Wu_Ming) [wrote](https://www.amazon.it/viaggio-promettiamo-breve-Venticinque-lotte/dp/8806225642/) an interesting book about the fights agaist high speed trains in Val di Susa (in Italian).
* [Understanding app performances in the wild](https://code.fb.com/android/profilo-understanding-app-performance-in-the-wild/). Facebook has released Profilo, an a high-throughput, mobile-first performance tracing library. This tool allows developers to collect and analyse production performance traces. Profilo is available only for Android, at least for now.
* [Lessons from Building Observability Tools at Netflix](https://medium.com/netflix-techblog/lessons-from-building-observability-tools-at-netflix-7cfafed6ab17). Netflix relies on several metrics to measure customers’ experience and to improve their product. Simply storing logs does not scale well and the microservice architecture adopted by Netflix introduces new challenges, too. Here is what Netflix did.

    * Logs are kept and processed in memory and persisted only when needed. The bigger the system is, the higher storage costs and query times are. See also [Mantis](https://medium.com/netflix-techblog/stream-processing-with-mantis-78af913f51a6).
    * Microservices produce several distributed streams of logs. In order the get new insights on logs it is important to enrich traces with contextual information "so that multiple traces can be grouped together across services".
    * Traces are not analysed by eye, of course. Metrics analysis should be automatized and alerts should be raised if anomalies are detected. Netflix went beyond trivial threshold alerting and implemented some statistical/machine learning algorithms to analyse metrics trends.
    * Log storing and retriving must be fast. Netflix used different databases (Cassandra, Elasticsearch, Hive) depending on the kinds of queries. For example, Elasticsearch is better for queries on different fields while Cassandra is better for queries by ids.
    * Logs and analysis are made available to engineers and users through custom user interfaces. It does not make sense to show all logs always because not everybody is able to understand them.

It would interesting to know what they do for limiting the overhead of log collecting on the whole system performances.

* [Living APIs, and the Case for GraphQL](https://brandur.org/graphql). The author says that, despite some interests from the developer community and some big players (e.g. Github), GraphQL isn't spreading very fast. The reason for the author is that "GraphQL’s biggest problem may be that,although it’s better, it’s not 'better enough'" with respect to REST. Then he makes some in depth arguments about why GraphQL is better. Instead, it would be interesting to know why it is not better enough.
* React 16 [makes available](https://building.calibreapp.com/debugging-react-performance-with-react-16-and-chrome-devtools-c90698a522ad) some performance metrics via browsers [User Timing API](https://www.html5rocks.com/en/tutorials/webperformance/usertiming/). This will open a lot of possibilities for [profiling components](https://reactjs.org/docs/optimizing-performance.html#profiling-components-with-the-chrome-performance-tab). For example, it could be interesting to see performance tools integrated into our CI processes. [Here](https://jobs.zalando.com/tech/blog/loading-time-matters/) is a report from Zalando engineers about their real world experience with performance optimization in React.