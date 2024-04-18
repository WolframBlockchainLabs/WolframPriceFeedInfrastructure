## ccxt-collectors.config

-   **rateLimit**: The global rate limit in milliseconds for the collectors.

    -   Default: `"{{CCXT_RATE_LIMIT}}"`

-   **rateLimitMargin**: The margin in milliseconds to consider while setting up rate limits.

    -   Example: `"{{CCXT_RATE_LIMIT_MARGIN}}"`

## ccxt-exchange.config

-   **id**: A unique identifier for the exchange.
-   **name**: The display name of the exchange.
-   **rateLimit**: The rate limit in milliseconds specific to the exchange (overrides the global rate limit if specified).
-   **minimalCycleDuration**: The minimal collectors fetch cycle duration in milliseconds.
-   **symbols**: An array of symbols that are available on the exchange.
-   **apiAccess**: A nested object that contains API credentials necessary for accessing the exchange. This includes:
    -   **apiKey**: A string representing the public API key provided by the exchange for accessing their services.
    -   **secret**: A string representing the private key or secret used in conjunction with the apiKey to authenticate requests.
    -   **uid**: A string that may represent a user identifier required by some exchanges for API access.
    -   **password**: A string used for additional security in API access, required by some exchanges.

#### Example Config of Exchanges

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

---

🟣 [Back to main doc file](../../../README.md)
