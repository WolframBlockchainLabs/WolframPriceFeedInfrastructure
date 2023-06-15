# CCDB application

## Feature 
Launching collectors to receive and store data on specific symbols (_markets_) from exchanges

Data is received in four directions: 
- order book 
- trade
- ticker
- candlestick

Retrieval of saved data by users within a specified range.

## Setup 

Setup the application need to take the following steps:

1. Have installed **Node.js®** version not lower than v. 18;

2. Have installed **docker-cli (_demon_)** to run docker environment;

3. Make sure the docker daemon is running

4. Run ```npm run docker:up``` command, which will create all necessary images and containers for the stable working of the application.
This command will create the contents of the arr itself, the database, the test database, and the collector launcher service (The list of services and their containers can be found in the docker folder in the _docker-compose.yml_ file).
Also this command running **application server** on port 8000 and **collectors service** for fetching and save data.

5. Run ```npm run docker:migration:db``` which create the necessary entities in the database;

6. After running migrations use ```npm run docker:seed:database``` which create five default exchanges in database (_Binance, Kraken, Gemini, Kucoin and Bitfinex_);

7. For rollback migration using ```npm run docker:migration:rollback:db```; 

8. To stop the service using ```npm run docker:down``` command.

## Testing

For running tests need to take the following steps:

1. Run ```npm run docker:up```;
2. Run ```npm run docker:migration:test```;
3. Run ```npm run docker:test:ava```.

## Project structure

**1. Configs**

For setting different configs for different pars of the application using **config.json**. 
For setting secure config options using file **".env.default"** that is located in the root folder.
Set the names of the exchanges and markets where data will be collected by collectors making in **config.json** in the section **"collectorManager"**. 

**2. Docker**

Directory **_docker_** include config files for setup docker environment. In particular file docker-compose.yml include basic setup for all the application's service which run in docker containers and created duging running ```npm run docker:up```.


**3. Lib**

1). Directory **_api/rest-api_** include all middlewares, routes and controller helps users interact with the application. In particular file foter include base endpoints that using on backend and provide possibility for user make requests to the web server.
Detailed information about endpoints provides in this [document](https://docs.google.com/document/d/19uerp83M06Sk8KeAF8MmpmZ2xkDFXb596DnAGadW3AU/edit#heading=h.n62o7iyrbu46).

2). Directory **_collectors_** include base logic of start and working collectors. There are four main collectors in the application. This are OrderBookCollector, CandleStickCollector, TradeCollector and TickerCollector. They retrieves data from different exchanges (list of exchanges set in config.json) using the [ccxt](https://docs.ccxt.com/#/) library. Collectors run with interval _(default interval is 60000 miliseconds)_.
After successful data acquisition, the collectors save the information to the database. The program uses TimescaleDB database for data storage.

3). Directory **_domain-model_** include a description of structure basic entities that use for working. That are Exchange, Markets, OrderBook, CandleStick, Ticker and Trade. Its help to take data from the database and return it according to the user's request. 

4). Directory **_infrastructure_** include general logger that uses in the application. It helps to make loggin of the application more convenient and understandable.

5). Directory **_use-cases_** include basic logic to interact with basic entities of the application.
The directory also contains the logic for validating data that the application receives from endpoints.


**4. Migrations**

Directory **_migrations_** include description of migrations that using in the application.

**5. Seeders**

Directory **_seeders_** include logic of create basic exchanges in the application's database.

**6. Tests**

Directory **_tests_** include end-to-end and unit tests. End-to-end tests help testing endpoints which the users use when interact with the application. Unit test using to test basic logic of the application's collectors. 

## Support

## Contributing
