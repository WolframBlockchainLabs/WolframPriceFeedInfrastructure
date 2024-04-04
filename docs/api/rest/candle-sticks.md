# CandleSticks HTTP API Documentation

## Table of Contents

1. [Get List of CandleSticks](#get-list-of-candlesticks)
1. [Aggregate CandleSticks](#aggregate-candlesticks)

## Get List of CandleSticks

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/candle-sticks`
-   **Query**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

**Description:**

The /api/v1/crypto/candle-sticks endpoint is designed to fetch historical candlestick data for a given cryptocurrency trading pair across specified exchanges. This data is crucial for technical analysis, allowing users to view price movements within a defined date range. The endpoint accommodates various query parameters to tailor the data request, including pagination controls (offset, limit), a date range for the data (rangeDateStart, rangeDateEnd), exchange names (exchangeNames[]), and the specific trading pair symbol (symbol).

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/candle-sticks?offset=0&limit=4&rangeDateStart=2023-12-07T23:58:00.000Z&rangeDateEnd=2023-12-07T23:59:00.000Z&exchangeNames[]=Binance&symbol=BTC/USDT"
```

**Example Response Payload:**

```json
{
    "data": [
        {
            "id": 138448,
            "marketId": 69,
            "charts": [
                [
                    1701993480000, 43273.99, 43281.02, 43260.68, 43281.01,
                    27.53241
                ]
            ],
            "createdAt": "2023-12-08T00:53:06.399Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-07T23:58:00.000Z",
            "intervalEnd": "2023-12-07T23:59:00.000Z"
        },
        {
            "id": 138410,
            "marketId": 69,
            "charts": [
                [1701993420000, 43266.3, 43274, 43252.42, 43274, 24.13456]
            ],
            "createdAt": "2023-12-08T00:52:06.760Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-07T23:57:00.000Z",
            "intervalEnd": "2023-12-07T23:58:00.000Z"
        },
        {
            "id": 138371,
            "marketId": 69,
            "charts": [
                [1701993360000, 43279.99, 43280, 43266.3, 43266.3, 17.43755]
            ],
            "createdAt": "2023-12-08T00:51:06.730Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-07T23:56:00.000Z",
            "intervalEnd": "2023-12-07T23:57:00.000Z"
        },
        {
            "id": 138333,
            "marketId": 69,
            "charts": [
                [1701993300000, 43254.79, 43280, 43253.65, 43279.99, 13.02447]
            ],
            "createdAt": "2023-12-08T00:50:06.688Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-07T23:55:00.000Z",
            "intervalEnd": "2023-12-07T23:56:00.000Z"
        },
        {
            "id": 138294,
            "marketId": 69,
            "charts": [
                [1701993240000, 43266.3, 43266.31, 43240.83, 43254.79, 15.64374]
            ],
            "createdAt": "2023-12-08T00:49:06.271Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-07T23:54:00.000Z",
            "intervalEnd": "2023-12-07T23:55:00.000Z"
        }
    ],
    "meta": {
        "fetchCount": 5
    },
    "status": 1
}
```

### Aggregate CandleSticks

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/candle-sticks/aggregate`
-   **Query**:
    -   `offset`: (integer) Aggregation offset (skips specified amount of records from the beginning of time frame. Not particularly useful in a common use case, but might be in some complex corner cases).
    -   `limit`: (integer) Number of records to be used in an aggregation round (heavily influences execution time and memory usage. The more records will be aggregated in one round the more memory it will take, but the execution time will be faster because it will take less requests to the database).
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `symbols[]`: (array) List of trading pair symbols (e.g. BTC/USDT).
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).

**Description:**

The /api/v1/crypto/candle-sticks/aggregate endpoint is designed to provide aggregated candlestick data for specified cryptocurrency trading pairs over a chosen date range. This endpoint is particularly useful for summarizing market data, offering insights into the open, high, low, close, and volume metrics, as well as an aggregated average price for each trading pair. It supports extensive customization through its query parameters, allowing users to define the scope of data aggregation by specifying date ranges, symbols for trading pairs, and the exchanges to be included.

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/candle-sticks/aggregate?offset=0&limit=100&rangeDateStart=2023-11-0100:00:00.000Z&rangeDateEnd=2024-11-30&symbols[]=BTC/USDT&symbols[]=ETH/USDT&exchangeNames[]=Binance"
```

**Example Response Payload:**

```json
{
    "data": {
        "rangeDateStart": "2023-11-01 00:00:00.000Z",
        "rangeDateEnd": "2024-11-30 23:59:59.000Z",
        "aggregatedPairs": {
            "BTC/USDT": {
                "open": 42169.97,
                "high": 44700,
                "low": 40400,
                "close": 42006,
                "volume": 269350.3820800009,
                "aggregatedAveragePrice": 42550
            },
            "ETH/USDT": {
                "open": null,
                "high": null,
                "low": null,
                "close": null,
                "volume": null,
                "aggregatedAveragePrice": null
            }
        }
    },
    "status": 1
}
```

_Note: `null` values indicate no data available for the specified period._

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main documentation](../../../README.md)
