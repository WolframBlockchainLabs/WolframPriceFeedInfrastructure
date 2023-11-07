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

 🟣 [Back to main doc file](../../README.md)
