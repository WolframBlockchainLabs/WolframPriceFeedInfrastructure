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

[Back to main doc file](../../README.md)
