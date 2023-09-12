# CCDB application

## Feature

Launching collectors to receive and store data on specific symbols (_markets_) from exchanges.

Four data types are currently supported:

-   order book
-   trade
-   ticker
-   candlestick
-   exchange rate

Retrieval of saved data by users within a specified range.

Historical data retrieval in specified ranges.

Fault tolerant distributed architecture.

Deterministic scheduling to comply with rate limits.

Cardano, XRPL, Tezos and ETH DEXs integrations

## Required

1. **Node.js®** version not lower than v. 18;

2. **docker-cli (_demon_)** to run docker environment;

## Setup

1. Make sure the docker daemon is running

2. In the root directory copy .env.example into .env and change parameters if needed

3. From the ./docker/env/_example directory copy .env.*example* files into ./docker/env/ and change parameters if needed

4. Run `./scripts/build` to build container images

5. Run `./scripts/start` to start containers

6. Run `npm run docker:migration:db` which will create the necessary entities in the database;

7. After running migrations, use `npm run docker:workers:ccxt-seeder:start` which will create five default exchanges in the database (_Binance, Kraken, Gemini, Kucoin and Bitfinex_) and others depending on collectors config;

8. To rollback migrations use `npm run docker:migration:rollback:db`;

9. To stop the service use `./scripts/stop` command.

## Testing

1. Run `./scripts/start`;
2. Run `npm run docker:migration:test`;
3. Run `npm run docker:test:ava` or `npm run docker:test:coverage` to get report on covered lines and branches.

## Project structure

**1. Configs**

For setting different configs for different pars of application using **_system.config.json_**.
For setting secure config options using file ".env.default" that is located in the root folder.
Set the names of the exchanges and markets where data will be collected by collectors making in **_collectors.config.json_**.

1. **_system.config_**



2. **_collectors.config.json_**

| Variable name        | TYPE     | EXAMPLE                              |
| -------------------- | -------- | ------------------------------------ |
| rateLimit            | Number   | 200                                  |
| rateLimitMargi       | Number   | 20                                   |
| replicaSize          | Number   | 2                                    |
| instancePosition     | Number   | 0                                    |
|                      | **exchanges** |                                 |
| id (in ccxt library) | String   | binance                              |
| name (official)      | String   | Binance                              |
| symbols              | String[] | BTC/USDT, ETH/USDT                   |
| rateLimit            | Number   | 200                                  |


**2. Docker**

The **_docker_** directory contains configuration files that are essential for setting up the Docker environment. In particular, the _docker-compose.yml_ file holds the foundational setup for all application services. These services run in Docker containers and are generated when you execute the `npm run docker:up` command.

**3. Lib**

1). The **_api/rest-api_** directory contains all necessary middlewares, routes, and controllers that facilitate user interactions with the application. Specifically, the 'router' file includes essential endpoints used on the backend, which enable users to make requests to the web server. More detailed information regarding these endpoints can be found within this [document](https://docs.google.com/document/d/19uerp83M06Sk8KeAF8MmpmZ2xkDFXb596DnAGadW3AU/edit#heading=h.n62o7iyrbu46).

2). The **_api/ws-api_** contains definition of a WebSocket Gateway that emits data about pair pricing.

3). The **_collectors_** directory contains the fundamental logic for initiating and operating the application's collectors. There are four primary collectors in the application: OrderBookCollector, CandleStickCollector, TradeCollector and TickerCollector. These collectors extract data from various exchanges, as specified in the _config.json_ file, using the [CCXT](https://docs.ccxt.com/#/) library. They operate at regular intervals, with the default interval set at 60000 milliseconds. Upon successful data retrieval, the collectors store this information into the database. The application utilizes the **TimescaleDB** database for its data storage needs.

4). The **_domain-model_** directory contains the sequelize's entities. Those are: Exchange, Markets, OrderBook, CandleStick, Ticker and Trade.

5). The **_infrastructure_** directory contains general logger that is used in the application. It helps to make the logging process of the application more convenient and understandable.

6). The **_use-cases_** directory houses the core logic necessary for interacting with the fundamental entities of the application. Additionally, it includes the logic responsible for validating data received from the application's endpoints.

**4. Migrations**

The **_migrations_** directory under domain model directory contains definitions of database migrations.

**5. Workers**

The **_workers_** directory contains the logic for creating initial exchange entries in the application's database.

**6. Tests**

The **_tests_** directory houses both end-to-end and unit tests. The end-to-end tests are used to evaluate the application's endpoints that users interact with. On the other hand, unit tests are utilized to verify the fundamental logic of the application's data collectors.

# Configuration files

## system.config

### General Settings

- **appPort**: The port on which the application will run. 
  - Example: `"{{PORT}}"`
- **appTestPort**: The port used for testing. 
  - Default: `3002`
- **appMode**: The mode in which the application will run (e.g., development, production). 
  - Example: `"{{NODE_ENV}}"`
- **mainUrl**: The main URL of the application. 
  - Example: `"{{MAIN_URL}}"`
- **projectName**: The name of the project. 
  - Example: `"{{PROJECT_NAME}}"`

### Database Settings

#### Main Database

- **db.username**: The username to connect to the main database. 
  - Example: `"{{DB_USERNAME}}"`
- **db.password**: The password to connect to the main database. 
  - Example: `"{{DB_PASSWORD}}"`
- **db.database**: The name of the main database. 
  - Example: `"{{DB_DATABASE}}"`
- **db.dialect**: The dialect of the main database (e.g., mysql, postgres). 
  - Example: `"{{DB_DIALECT}}"`
- **db.host**: The host of the main database. 
  - Example: `"{{DB_HOST}}"`
- **db.port**: The port of the main database. 
  - Example: `"{{DB_PORT}}"`

#### Test Database

- **test-db.username**: The username to connect to the test database. 
  - Example: `"{{TEST_DB_USERNAME}}"`
- **test-db.password**: The password to connect to the test database. 
  - Example: `"{{TEST_DB_PASSWORD}}"`
- **test-db.database**: The name of the test database. 
  - Example: `"{{TEST_DB_DATABASE}}"`
- **test-db.dialect**: The dialect of the test database (e.g., mysql, postgres). 
  - Example: `"{{TEST_DB_DIALECT}}"`
- **test-db.host**: The host of the test database. 
  - Example: `"{{TEST_DB_HOST}}"`
- **test-db.port**: The port of the test database. 
  - Example: `"{{TEST_DB_PORT}}"`

### RabbitMQ Settings

- **rabbitmq.urls**: An array of URLs to connect to RabbitMQ. 
  - Example: 
    ```
    [
        "amqp://{{RABBITMQ_USER}}:{{RABBITMQ_PASS}}@{{RABBITMQ_HOST}}:5672/"
    ]
    ```

### Logger Settings

- **logger.isPlainText**: Flag to determine if the logs should be in plain text format. 
  - Example: `"{{LOGGER_PLAIN_TEXT}}"`
- **logger.level**: The level of logging (e.g., info, warn, error). 
  - Example: `"{{LOGGER_LEVEL}}"`
- **logger.transports**: An array of transport objects that define how logs should be transported. 
  - Example: 
    ```
    [
        {
            "type": "console",
            "pretty": true
        }
    ]
    ```

### Interval Settings

- **intervals.marketsRefresher**: The interval at which the markets refresher function should run. 
  - Example: `"{{MARKETS_REFRESHER_INTERVAL}}"`

---

Please, note that the placeholders (like `{{PORT}}`) should be replaced with actual values during runtime or configuration setup.

## ccxt-collectors.config

### General Settings

- **rateLimit**: The global rate limit for the collectors.
  - Default: `1000`

- **rateLimitMargin**: The margin to consider while setting up rate limits.
  - Example: `"{{CCXT_RATE_LIMIT_MARGIN}}"`

- **replicaSize**: The size of the replica set.
  - Example: `"{{CCXT_REPLICA_SIZE}}"`

- **instancePosition**: The position of this instance in the replica set.
  - Example: `"{{CCXT_INSTANCE_POSITION}}"`

### Exchanges

The configuration contains an array of exchange objects with the following properties:

#### Exchange Object Properties

- **id**: A unique identifier for the exchange.
- **name**: The display name of the exchange.
- **rateLimit**: The rate limit specific to the exchange (overrides the global rate limit if specified).
- **symbols**: An array of symbols that are available on the exchange.

#### Available Exchanges

1. **Binance**
   - ID: `binance`
   - Name: `Binance`
   - Symbols: `["BTC/EUR", "BTC/USDT", "ETH/USDT", "ETH/EUR", "LTC/BTC"]`

2. **KuCoin**
   - ID: `kucoin`
   - Name: `KuCoin`
   - Rate Limit: `100`
   - Symbols: `["BTC/EUR", "BTC/USDT", "ETH/USDT", "ETH/EUR", "LTC/BTC"]`

3. **Gemini**
   - ID: `gemini`
   - Name: `Gemini`
   - Rate Limit: `200`
   - Symbols: `["BTC/EUR", "BTC/USDT", "ETH/USDT", "ETH/EUR", "LTC/BTC"]`

4. **Kraken**
   - ID: `kraken`
   - Name: `Kraken`
   - Symbols: `["BTC/EUR", "BTC/USDT", "ETH/USDT", "ETH/EUR", "LTC/BTC"]`

5. **Bitfinex**
   - ID: `bitfinex`
   - Name: `Bitfinex`
   - Rate Limit: `2000`
   - Symbols: `["BTC/EUR", "BTC/USDT", "ETH/USDT", "ETH/EUR", "LTC/BTC"]`

---

Please replace the placeholders (e.g., `{{CCXT_RATE_LIMIT_MARGIN}}`) with actual values during runtime or configuration setup.

## xrpl-collectors.config

### General Settings

- **rateLimit**: The global rate limit applied to the instance, to prevent excessive requests.
  - Default: `80`

- **rateLimitMargin**: The margin applied to the rate limit to allow for flexibility and prevent limit breaches.
  - Example: `"{{XRPL_RATE_LIMIT_MARGIN}}"`

- **replicaSize**: The number of replicas in the replica set for distributed operations.
  - Example: `"{{XRPL_REPLICA_SIZE}}"`

- **instancePosition**: The specific position of this instance within the replica set.
  - Example: `"{{XRPL_INSTANCE_POSITION}}"`

- **serverUrl**: The URL of the XRPL server that the instance interacts with.
  - Example: `"{{XRPL_SERVER_URL}}"`

### Exchange Settings

The exchange object specifies details about the exchange being used in the configuration:

- **exchange.id**: A unique identifier for the exchange.
  - Example: `"xrpl"`
  
- **exchange.name**: The display name of the exchange.
  - Example: `"XRPL"`

### Market Settings

The configuration includes an array of market objects that contain the following details:

#### Market Object Properties

- **pair**: An object describing the currency pair being traded, including base and counter currency details and the issuers involved.
  
- **symbol**: A string that represents the market symbol for the given pair in a more human-readable format.

### Example Market Setup

Here's a brief look at how a market setup might look:

- **pair**
  - **base**
    - **currency**: The base currency in the pair (e.g., "XRP").
  - **counter**
    - **currency**: The counter currency in the pair (e.g., "USD").
    - **issuer**: The issuer of the counter currency.

- **symbol**: A representative string of the market pair (e.g., "XRP/Bitstamp-USD").

---

Note: The placeholders (e.g., `{{XRPL_RATE_LIMIT_MARGIN}}`) should be replaced with actual values during runtime or configuration setup.

## eth-collectors.config

### General Settings

- **rateLimit**: The rate limit which controls the number of requests allowed in a specified time frame.
  - Default: `6000`
  
- **rateLimitMargin**: The margin to incorporate with the rate limit for safer operation within the limits.
  - Example: `"{{ETH_RATE_LIMIT_MARGIN}}"`

- **replicaSize**: The size of the replica set for the configuration.
  - Example: `"{{ETH_REPLICA_SIZE}}"`

- **instancePosition**: The position of this particular instance in the replica set.
  - Example: `"{{ETH_INSTANCE_POSITION}}"`

- **providerUrl**: The URL of the Ethereum blockchain provider.
  - Example: `"{{ETH_PROVIDER_URL}}"`

### Exchange Settings

The configuration contains an array of exchange objects detailing the exchanges and the markets available on them. Each exchange object contains the following fields:

- **id**: A unique identifier for the exchange.
  
- **name**: The name of the exchange.

- **markets**: An array of market objects available on the exchange, each containing information on the trading pairs and symbols.

#### Market Object Structure

Each market object contains details of the trading pairs available on the exchange. Here’s a brief overview of the properties:

- **pair**: Details of the trading pair, including the addresses, decimals, symbols, and names for the input (`in`) and output (`out`) tokens, and for Uniswap v2 and SushiSwap, the liquidity pool address (`pool`).
  
- **symbol**: A human-friendly representation of the trading pair, usually denoting the trading route, e.g., "WETH/USDC".

### Example of a Market Object

Here is a basic structure of a market object:

- **pair**
  - **in**
    - **address**: The contract address of the input token.
    - **decimals**: The number of decimals the input token uses.
    - **symbol**: The symbol of the input token.
    - **name**: The name of the input token.
  - **out**
    - **address**: The contract address of the output token.
    - **decimals**: The number of decimals the output token uses.
    - **symbol**: The symbol of the output token.
    - **name**: The name of the output token.
    
- **symbol**: A representation of the trading pair as a string, e.g., "DAI/WETH".

---

*Note*: The placeholder values (e.g., `{{ETH_RATE_LIMIT_MARGIN}}`) should be replaced with actual values during runtime.

## tezos-collectors.config

### General Settings

- **rateLimit**: This is the rate limit, which specifies the number of requests allowed within a defined time frame.
  - Default: `200`
  
- **rateLimitMargin**: This is a margin to consider with the rate limit to ensure operations stay within safe limits.
  - Example: `"{{TEZOS_RATE_LIMIT_MARGIN}}"`

- **replicaSize**: This indicates the size of the replica set for the configuration.
  - Example: `"{{TEZOS_REPLICA_SIZE}}"`

- **instancePosition**: This indicates the position of the current instance within the replica set.
  - Example: `"{{TEZOS_INSTANCE_POSITION}}"`

- **providerUrl**: This is the URL of the Tezos blockchain provider.
  - Example: `"{{TEZOS_PROVIDER_URL}}"`

### Exchange Settings

The configuration includes an array of exchange objects which provide details on the exchanges and the markets available on them. Each exchange object includes the following fields:

- **id**: A unique identifier for the exchange.
  
- **name**: The name of the exchange.

- **markets**: An array of market objects available on the exchange, each with information on trading pairs and symbols.

#### Market Object Structure

Each market object contains details on the trading pairs available on the exchange. Here's a brief overview of the properties:

- **pair**: Details of the trading pair including the liquidity pool identifier (`pool`) and details about the input (`in`) and output (`out`) tokens.
  
- **symbol**: A human-friendly representation of the trading pair, usually indicating the trading route, e.g., "TEZ/QUIPU".

#### Pair Object

The pair object within each market provides information on the trading pair and includes the following fields:

- **pool**: The identifier or address of the liquidity pool for the trading pair.
  
- **in**: Information about the input token, including:
  - **address** (optional): The contract address of the input token (if applicable).
  - **decimals** (optional): The number of decimals the input token uses (if applicable).
  - **symbol**: The symbol of the input token.
  - **name**: The name of the input token.
  
- **out**: Information about the output token, including:
  - **address** (optional): The contract address of the output token (if applicable).
  - **decimals** (optional): The number of decimals the output token uses (if applicable).
  - **symbol**: The symbol of the output token.
  - **name**: The name of the output token.

- **symbol**: A representation of the trading pair in a string format, e.g., "ctez/kUSD".

---

*Note*: Placeholder values (e.g., `{{TEZOS_RATE_LIMIT_MARGIN}}`) should be replaced with actual values during runtime.

## cardano-collectors.config

### General Settings

- **rateLimit**: The maximum number of requests allowed within a specified time frame.
  - Default: `6000`

- **rateLimitMargin**: A margin to ensure operations stay within the safe limits of the rate limit.
  - Example: `"{{CARDANO_RATE_LIMIT_MARGIN}}"`

- **replicaSize**: Specifies the size of the replica set for the configuration.
  - Example: `"{{CARDANO_REPLICA_SIZE}}"`

- **instancePosition**: The position of the current instance within the replica set.
  - Example: `"{{CARDANO_INSTANCE_POSITION}}"`

- **projectId**: The project ID related to the Blockfrost API integration.
  - Example: `"{{CARDANO_BLOCKFROST_PROJECT_ID}}"`

### Exchange Settings

The configuration contains an array of exchange objects describing the exchanges and the markets available on them. Each exchange object has the following fields:

- **id**: Unique identifier for the exchange.
- **name**: The name of the exchange.
- **markets**: An array containing market objects available on the exchange. Each market object contains trading pairs and symbols information.

#### Market Object Structure

Each market object provides information about the available trading pairs on the exchange. Here's a brief description of the properties:

- **pair**: This contains details of the trading pair, including liquidity pool identifier (`pool`) and information about the input (`in`) and output (`out`) tokens. Optionally, it may contain a `poolUtxo` field representing the Unspent Transaction Output (UTXO) identifier for the pool.
  
- **symbol**: A representation of the trading pair, generally indicating the trading route, e.g., "ADA/MIN".

#### Pair Object

The pair object within each market object provides the following fields:

- **pool**: The liquidity pool identifier or address for the trading pair.
- **poolUtxo** (optional): A specific identifier for UTXO in the liquidity pool.
- **in**: Information about the input token, including:
  - **address**: The contract address or designation for the input token.
  - **decimals**: The number of decimal places used by the input token.
  - **symbol**: The symbol representing the input token.
  - **name**: The name of the input token.
  
- **out**: Information about the output token, including:
  - **address**: The contract address or designation for the output token.
  - **decimals**: The number of decimal places used by the output token.
  - **symbol**: The symbol representing the output token.
  - **name**: The name of the output token.

- **symbol**: A string representation of the trading pair, e.g., "ADA/MILK".

---

**Note**: Placeholder values (e.g., `{{CARDANO_RATE_LIMIT_MARGIN}}`) are to be replaced with actual values during the configuration setup.
