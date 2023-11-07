## Project structure

**1. Configs**

This directory contains multiple .json configuration files for the overall system and collectors, powered by confme.js.
A detailed explanation of each file is in **Configuration files** section

**2. Docker**

The **_docker_** directory contains configuration files that are essential for setting up the Docker environment. In particular, the _docker-compose.yml_ file holds the foundational setup for all application services. These services run in Docker containers and are generated when you execute the `npm run docker:up` command.

**3. Lib**

1). The **_api/rest-api_** directory contains all necessary middlewares, routes, and controllers that facilitate user interactions with the application. Specifically, the 'router' file includes essential endpoints used on the backend, which enable users to make requests to the web server. More detailed information regarding these endpoints can be found within this [document](https://docs.google.com/document/d/19uerp83M06Sk8KeAF8MmpmZ2xkDFXb596DnAGadW3AU/edit#heading=h.n62o7iyrbu46).

2). The **_api/ws-api_** contains definition of a WebSocket Gateway that emits data about pair pricing.

3). The **_collectors_** directory contains the fundamental logic for initiating and operating the application's collectors. There are four primary collectors in the application: OrderBookCollector, CandleStickCollector, TradeCollector and TickerCollector. These collectors extract data from various exchanges using the [CCXT](https://docs.ccxt.com/#/) library. They operate at regular intervals which is calculated based on rate limits and the amount of markets. Upon successful data retrieval, the collectors store this information into the database. The application utilizes the **TimescaleDB** database for its data storage needs.

4). The **_domain-model_** directory contains the sequelize's entities. Those are: Exchange, Markets, OrderBook, CandleStick, Ticker, ExchangeRate and Trade.

5). The **_infrastructure_** directory contains amqp client setup and a logger that is used in the application. It helps to make the logging process of the application more convenient and understandable.

6). The **_use-cases_** directory houses the core logic necessary for interacting with the fundamental entities of the application. Additionally, it includes the logic responsible for validating data received from the application's endpoints.

**4. Migrations**

The **_migrations_** directory under domain model directory contains definitions of database migrations.

**5. Workers**

The **_workers_** directory contains definitions of services entrypoints. Those services could include seeders, or database refreshers.

**6. Tests**

The **_tests_** directory houses both end-to-end and unit tests. The end-to-end tests are used to evaluate the application's endpoints that users interact with. On the other hand, unit tests are utilized to verify the fundamental logic of the application's data collectors.

---

 🟣 [Back to main doc file](../README.md)
