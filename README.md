# CCDB application

## Feature 
Launching collectors to receive and store data on specific symbols (_markets_) from exchanges

Data is received in four directions: 
- order book 
- trade
- ticker
- candlestick

Retrieval of saved data by users within a specified range

## Setup 

Setup application need to take the following steps:

1. Have installed **Node.js®** version not lower than v. 18;
2. Have installed **docker-cli (_demon_)** to run docker environment;
3. git clone  ??????????????????????
4. Make sure the docker daemon is running
5. Run ```npm run docker:up``` command, which will create all necessary images and containers for the stable working of the application.
This command will create the contents of the arr itself, the database, the test database, and the collector launcher service (The list of services and their containers can be found in the docker folder in the _docker-compose.yml_ file).
Also this command running **application server** on port 8000 and **collectors service** for fetching and save data.
6. Run ```npm run docker:migration:db``` which create the necessary entities in the database;
7. After running migrations use ```npm run docker:seed:database``` which create five default exchanges in database (_Binance, Kraken, Gemini, Kucoin and Bitfinex_);
8. For rollback migration using ```npm run docker:migration:rollback:db```; 
9. To stop the service using ```npm run docker:down``` command.

## Run test

For running tests need to take the following steps:

1. Run ```npm run docker:up```;
2. Run ```npm run docker:migration:test```;
3. Run ```npm run docker:test:ava```.

## Project structure

1. Directory **"configs"** include base config for application.
2. Directory **"docker"** include config files for setup docker environment. In particular file docker-compose.yml include basic setup for all application's service which run in docker containers;
3. Directory **"lib"** include base code of application (_routes, collectors, models, use-cases(services), init database connection, tests_)


## Configs 

For setting different configs for different pars of application using **config.json**. 
For setting secure config options using file **".env.default"** that is located in the root folder.
Set the names of the exchanges and markets where data will be collected by collectors making in **config.json** in the section **"collectorManager"**. 

## Support

## Contributing
