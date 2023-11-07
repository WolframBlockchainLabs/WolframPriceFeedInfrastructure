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

---

 🟣 [Back to main doc file](../../README.md)
