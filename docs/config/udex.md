## udex-collectors.config

-   **groupName**: A name of a group for drivers that are united by a common external dependency e.g. blockchain RPC node.

    -   Example: `Cardano`

-   **rateLimit**: The maximum number of requests allowed within a specified time frame.

    -   Default: `6000`

-   **rateLimitMargin**: A margin to ensure operations stay within the safe limits of the rate limit.

    -   Example: `"{{CARDANO_RATE_LIMIT_MARGIN}}"`

-   **replicaSize**: Specifies the size of the replica set for the configuration.

    -   Example: `"{{CARDANO_REPLICA_SIZE}}"`

-   **instancePosition**: The position of the current instance within the replica set.

    -   Example: `"{{CARDANO_INSTANCE_POSITION}}"`

-   **apiSecret**: The secret used in any driver to connect to the remote RPC endpoint or API server.

    -   Example: `"{{CARDANO_BLOCKFROST_PROJECT_ID}}"`

-   **meta**: An object that contains any additional required data for driver's initialization.
    -   Example: `{ requestTTL: 3000 }`

## udex-exchange.config

-   **id**: Unique identifier for the exchange.
-   **name**: The name of the exchange.
-   **markets**: An array containing market objects available on the exchange. Each market object contains trading pairs and symbols information.
-   **meta**: An object that contains any additional required data.

#### Market Object Structure

Each market object provides information about the available trading pairs on the exchange. Here's a brief description of the properties:

-   **pair**: This contains details of the trading pair, including information about the input (`in`) and output (`out`) tokens. Optionally, it may contain a `meta` object that describes exchange-specific field like liquidity pool identifier (`pool`) and `poolUtxo` field representing the Unspent Transaction Output (UTXO) identifier for the pool.
-   **symbol**: A representation of the trading pair, generally indicating the trading route, e.g., "ADA/MIN".

#### Pair Object

The pair object within each market object provides the following fields:

-   **meta**: An object that contains any additional required data.
-   **in**: Information about the input token, including:
    -   **meta**: An object that contains any additional required data.
    -   **symbol**: The symbol representing the input token.
    -   **name**: The name of the input token.
-   **out**: Information about the output token, including:

    -   **meta**: An object that contains any additional required data.
    -   **symbol**: The symbol representing the output token.
    -   **name**: The name of the output token.

-   **symbol**: A string representation of the trading pair, e.g., "ADA/MILK".

---

**Note**: Placeholder values (e.g., `{{CARDANO_RATE_LIMIT_MARGIN}}`) are to be replaced with actual values during the configuration setup.

---

🟣 [Back to main doc file](../../../README.md)
