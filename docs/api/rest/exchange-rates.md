# ExchangeRates HTTP API Documentation

## Table of Contents

1. [Get List of ExchangeRates](#get-list-of-exchangerates)

## Get List of ExchangeRates

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/exchange-rates`
-   **Query**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

**Description:**

The /api/v1/crypto/exchange-rates endpoint is tailored for retrieving historical exchange rate data for various cryptocurrency trading pairs across selected exchanges. Through the use of query parameters like pagination (offset, limit), date range (rangeDateStart, rangeDateEnd), exchange names (exchangeNames[]), and trading pair symbols (symbol), users can effectively filter and analyze exchange rate movements.

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/exchange-rates?offset=0&limit=5&rangeDateStart=2023-12-11T14:12:00.000Z&rangeDateEnd=2023-12-11T14:22:00.000Z&exchangeNames[]=Uniswap_v3&symbol=WETH/USDC"
```

**Example Response Payload:**

```json
{
    "data": [
        {
            "id": 1105981,
            "marketId": 31,
            "poolASize": null,
            "poolBSize": null,
            "exchangeRate": "2217.24095900000000000000000000000000",
            "createdAt": "2023-12-11T15:29:21.071Z",
            "exchangeName": "Uniswap_v3",
            "symbol": "WETH/USDC",
            "intervalStart": "2023-12-11T14:20:00.000Z",
            "intervalEnd": "2023-12-11T14:22:00.000Z"
        },
        {
            "id": 1105961,
            "marketId": 31,
            "poolASize": null,
            "poolBSize": null,
            "exchangeRate": "2217.24095900000000000000000000000000",
            "createdAt": "2023-12-11T15:27:20.904Z",
            "exchangeName": "Uniswap_v3",
            "symbol": "WETH/USDC",
            "intervalStart": "2023-12-11T14:18:00.000Z",
            "intervalEnd": "2023-12-11T14:20:00.000Z"
        },
        {
            "id": 1105941,
            "marketId": 31,
            "poolASize": null,
            "poolBSize": null,
            "exchangeRate": "2217.24095900000000000000000000000000",
            "createdAt": "2023-12-11T15:25:20.848Z",
            "exchangeName": "Uniswap_v3",
            "symbol": "WETH/USDC",
            "intervalStart": "2023-12-11T14:16:00.000Z",
            "intervalEnd": "2023-12-11T14:18:00.000Z"
        },
        {
            "id": 1105921,
            "marketId": 31,
            "poolASize": null,
            "poolBSize": null,
            "exchangeRate": "2217.24095900000000000000000000000000",
            "createdAt": "2023-12-11T15:23:20.844Z",
            "exchangeName": "Uniswap_v3",
            "symbol": "WETH/USDC",
            "intervalStart": "2023-12-11T14:14:00.000Z",
            "intervalEnd": "2023-12-11T14:16:00.000Z"
        },
        {
            "id": 1105901,
            "marketId": 31,
            "poolASize": null,
            "poolBSize": null,
            "exchangeRate": "2217.24095900000000000000000000000000",
            "createdAt": "2023-12-11T15:21:20.823Z",
            "exchangeName": "Uniswap_v3",
            "symbol": "WETH/USDC",
            "intervalStart": "2023-12-11T14:12:00.000Z",
            "intervalEnd": "2023-12-11T14:14:00.000Z"
        }
    ],
    "meta": {
        "fetchCount": 5
    },
    "status": 1
}
```

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main documentation](../../../README.md)
