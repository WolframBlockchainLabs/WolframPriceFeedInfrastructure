## ccxt-collectors.config

- **rateLimit**: The global rate limit for the collectors.
  - Default: `1000`

- **rateLimitMargin**: The margin to consider while setting up rate limits.
  - Example: `"{{CCXT_RATE_LIMIT_MARGIN}}"`

- **replicaSize**: The size of the replica set.
  - Example: `"{{CCXT_REPLICA_SIZE}}"`

- **instancePosition**: The position of this instance in the replica set.
  - Example: `"{{CCXT_INSTANCE_POSITION}}"`

## ccxt-exchange.config

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

---

 🟣 [Back to main doc file](../../../README.md)
