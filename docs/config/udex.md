## udex-collectors.config

-   **groupName**: A name of a group for drivers that are united by a common external dependency e.g. blockchain RPC node.

    -   Example: `Cardano`

-   **rateLimit**: The global rate limit in milliseconds for the collectors.

    -   Default: `"{{CARDANO_RATE_LIMIT}}"`

-   **rateLimitMargin**: The margin in milliseconds to consider while setting up rate limits.

    -   Example: `"{{CARDANO_RATE_LIMIT_MARGIN}}"`

-   **baseSleepReloadTime**: The time in milliseconds scheduler will sleep between reloads on demand.

    -   Example: `"{{CARDANO_BASE_SLEEP_RELOAD_TIME}}"`

-   **apiSecret**: The secret used in any driver to connect to the remote RPC endpoint or API server.

    -   Example: `"{{CARDANO_BLOCKFROST_PROJECT_ID}}"`

-   **meta**: An object that contains any additional required data for driver's initialization.
    -   Example: `{ requestTTL: 3000 }`

#### Process Allocation Config

-   **processAllocation.potentialExchangeSize**: Expected maximum amount of markets inside an exchange.

    -   Example: `"{{CARDANO_POTENTIAL_EXCHANGE_SIZE}}"`

-   **processAllocation.tolerableProcessSize**: Expected maximum amount of markets per process.

    -   Example: `"{{CARDANO_TOLERABLE_PROCESS_SIZE}}"`

-   **processAllocation.tolerableParallelExchanges**: Expected maximum amount of exchanges inside one process.
    -   Example: `"{{CARDANO_TOLERABLE_PARALLEL_EXCHANGES}}"`

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
