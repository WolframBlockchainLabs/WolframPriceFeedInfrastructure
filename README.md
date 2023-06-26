# CCDB application

## Feature

Launching collectors to receive and store data on specific symbols (_markets_) from exchanges.

Four data types are currently supported:

-   order book
-   trade
-   ticker
-   candlestick

Retrieval of saved data by users within a specified range.

## Required

1. **Node.js®** version not lower than v. 18;

2. **docker-cli (_demon_)** to run docker environment;

## Setup

1. Make sure the docker daemon is running

2. Run `./scripts/build` to build container images

3. Run `./scripts/start` to start containers

4. Run `npm run docker:migration:db` which will create the necessary entities in the database;

5. After running migrations, use `npm run docker:seed:database` which will create five default exchanges in the database (_Binance, Kraken, Gemini, Kucoin and Bitfinex_);

6. To rollback migrations use `npm run docker:migration:rollback:db`;

7. To stop the service use `./scripts/stop` command.

## Testing

1. Run `./scripts/start`;
2. Run `npm run docker:migration:test`;
3. Run `npm run docker:test:ava`.

## Project structure

**1. Configs**

For setting different configs for different pars of application using **_system.config.json_**.
For setting secure config options using file ".env.default" that is located in the root folder.
Set the names of the exchanges and markets where data will be collected by collectors making in **_collectors.config.json_**.

1. **_system.config_**

| Variable name | TYPE        | EXAMPLE                 |
| ------------- | ----------- | ----------------------- |
| appPort       | Number      | 3000                    |
| appTestPort   | Number      | 3002                    |
| appMode       | String      | prod                    |
| mainUrl       | String      | "http://localhost:8000" |
| projectName   | String      | ccdb                    |
|               | **db**      |                         |
| username      | String      | pgUserName              |
| password      | String      | yourPassword            |
| database      | String      | yourDatabese            |
| dialect       | String      | postgres                |
| host          | String      | localhost               |
| port          | Number      | 5432                    |
|               | **test-db** |                         |
| username      | String      | pgUserNameTest          |
| password      | String      | yourPasswordTest        |
| database      | String      | yourDatabeseTest        |
| dialect       | String      | postgres                |
| host          | String      | localhost               |
| port          | Number      | 5432                    |

2. **_collectors.config.json_**

| Variable name        | TYPE     | EXAMPLE                                |
| -------------------- | -------- | -------------------------------------- |
| interval             | Number   | 60000                                  |
| id (in ccxt library) | String   | binance                                |
| name (official)      | String   | Binance                                |
| apiKey               | String   | jfddsddsf78988!!!85fddsfadd            |
| apiSecret            | String   | sdafasdfsaljfasf==-l122113kjlfsad11!!@ |
| symbols              | String[] | BTC/USDT, ETH/USDT                     |

**2. Docker**

The **_docker_** directory contains configuration files that are essential for setting up the Docker environment. In particular, the _docker-compose.yml_ file holds the foundational setup for all application services. These services run in Docker containers and are generated when you execute the `npm run docker:up` command.

**3. Lib**

1). The **_api/rest-api_** directory contains all necessary middlewares, routes, and controllers that facilitate user interactions with the application. Specifically, the 'router' file includes essential endpoints used on the backend, which enable users to make requests to the web server. More detailed information regarding these endpoints can be found within this [document](https://docs.google.com/document/d/19uerp83M06Sk8KeAF8MmpmZ2xkDFXb596DnAGadW3AU/edit#heading=h.n62o7iyrbu46).

2). The **_collectors_** directory contains the fundamental logic for initiating and operating the application's collectors. There are four primary collectors in the application: OrderBookCollector, CandleStickCollector, TradeCollector and TickerCollector. These collectors extract data from various exchanges, as specified in the _config.json_ file, using the [CCXT](https://docs.ccxt.com/#/) library. They operate at regular intervals, with the default interval set at 60000 milliseconds. Upon successful data retrieval, the collectors store this information into the database. The application utilizes the **TimescaleDB** database for its data storage needs.

3). The **_domain-model_** directory contains the sequelize's entities. Those are: Exchange, Markets, OrderBook, CandleStick, Ticker and Trade.

4). The **_infrastructure_** directory contains general logger that is used in the application. It helps to make the logging process of the application more convenient and understandable.

5). The **_use-cases_** directory houses the core logic necessary for interacting with the fundamental entities of the application. Additionally, it includes the logic responsible for validating data received from the application's endpoints.

**4. Migrations**

The **_migrations_** directory contains definitions of database migrations.

**5. Workers**

The **_workers_** directory contains the logic for creating initial exchange entries in the application's database.

**6. Tests**

The **_tests_** directory houses both end-to-end and unit tests. The end-to-end tests are used to evaluate the application's endpoints that users interact with. On the other hand, unit tests are utilized to verify the fundamental logic of the application's data collectors.

## Support

## Contributing
