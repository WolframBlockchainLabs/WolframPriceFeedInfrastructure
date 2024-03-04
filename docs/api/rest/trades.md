# Trades HTTP API Documentation

## Table of Contents

1. [Get List of Trades](#get-list-of-trades)

## Get List of Trades

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/trades`
-   **Query**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

**Description:**

The /api/v1/crypto/trades endpoint is designed to retrieve detailed information on individual trades for specific cryptocurrency pairs across various exchanges within a given date range. Each record in the response provides data on trade transactions. The first element in the tradesInfo array is a numerical representation of the trade's side (0 for 'buy', 1 for 'sell'), including price, volume, and the exact timestamp, among other details. This endpoint is invaluable for analyzing market movements, trade patterns, and liquidity by offering granular trade data. It supports comprehensive filtering through query parameters such as pagination (offset, limit), time range (rangeDateStart, rangeDateEnd), exchange names (exchangeNames[]), and trading pair symbols (symbol).

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/trades?offset=0&limit=5&rangeDateStart=2023-12-11T15:25:00.000Z&rangeDateEnd=2023-12-11T15:30:00.000Z&exchangeNames[]=Kraken&symbol=BTC/USDT"
```

**Example Response Payload:**

```json
{
    "data": [
        {
            "id": 344158,
            "marketId": 20,
            "tradesInfo": [
                [0, 41891.1, 0.00286926, 1702308567612],
                [0, 41897.1, 0.00208735, 1702308579175],
                [0, 41891.1, 0.02258183, 1702308589174]
            ],
            "createdAt": "2023-12-11T15:31:11.798Z",
            "exchangeName": "Kraken",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:29:00.000Z",
            "intervalEnd": "2023-12-11T15:30:00.000Z"
        },
        {
            "id": 344117,
            "marketId": 20,
            "tradesInfo": [
                [1, 41897.9, 0.05, 1702308499073],
                [1, 41897.9, 0.10292988, 1702308499073],
                [1, 41897.4, 0.002487, 1702308499073],
                [1, 41897.3, 0.01962735, 1702308499073],
                [1, 41895.9, 0.09024699, 1702308499073],
                [1, 41895.4, 0.03470878, 1702308499073]
            ],
            "createdAt": "2023-12-11T15:30:11.762Z",
            "exchangeName": "Kraken",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:28:00.000Z",
            "intervalEnd": "2023-12-11T15:29:00.000Z"
        },
        {
            "id": 344076,
            "marketId": 20,
            "tradesInfo": [],
            "createdAt": "2023-12-11T15:29:11.795Z",
            "exchangeName": "Kraken",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:27:00.000Z",
            "intervalEnd": "2023-12-11T15:28:00.000Z"
        },
        {
            "id": 344037,
            "marketId": 20,
            "tradesInfo": [
                [0, 41900.1, 0.03200524, 1702308362414],
                [0, 41909.4, 0.00023861, 1702308400345]
            ],
            "createdAt": "2023-12-11T15:28:12.696Z",
            "exchangeName": "Kraken",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:26:00.000Z",
            "intervalEnd": "2023-12-11T15:27:00.000Z"
        },
        {
            "id": 343996,
            "marketId": 20,
            "tradesInfo": [],
            "createdAt": "2023-12-11T15:27:12.672Z",
            "exchangeName": "Kraken",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:25:00.000Z",
            "intervalEnd": "2023-12-11T15:26:00.000Z"
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
