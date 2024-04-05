# CandleSticks HTTP API Documentation

## Table of Contents

1. [Get List of CandleSticks](#get-list-of-candlesticks)
2. [Aggregate CandleSticks](#aggregate-candlesticks)
3. [Aggregate CandleSticks Discretely](#aggregate-candlesticks-discretely)
4. [Request Discrete Candle Sticks Aggregation](#request-discrete-candle-sticks-aggregation)
5. [Get Discrete Aggregation Task Results](#get-discrete-aggregation-task-results)
6. [List Discrete Aggregation Task Results](#list-discrete-aggregation-task-results)

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

## Aggregate CandleSticks

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

## Aggregate CandleSticks Discretely

- **Method**: GET
- **Endpoint**: `/api/v1/crypto/candle-sticks/aggregate-discrete`
- **Query**:
    - `rangeDateStart`: (string) The start date and time of the requested data range.
    - `rangeDateEnd`: (string) The end date and time of the requested data range.
    - `symbols[]`: (array) The list of cryptocurrency pair symbols (e.g. BTC/USDT, ETH/USDT).
    - `exchangeNames[]`: (array) The list of exchanges from which the data is to be aggregated (e.g. Binance, Bybit, OKX).
    - `timeframeMinutes`: (integer) The time frame in minutes for each candlestick data point.

**Description:**

The `/api/v1/crypto/candle-sticks/aggregate-discrete` endpoint aggregates candlestick data for specified cryptocurrency pairs from multiple exchanges within a defined date and time range. Each data point corresponds to a discrete time interval set by `timeframeMinutes`. This endpoint is useful for users who need to perform technical analysis on cryptocurrency markets by studying the open, high, low, and close prices, as well as the volume within each time frame. The maximum difference between `rangeDateStart` and `rangeDateEnd` is limited to one day to avoid HTTP server overload. This can be controlled by environment variables provided to the server. In case you need to process larger data volumes - use tasks requests system.

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/candle-sticks/aggregate-discrete?rangeDateStart=2024-04-01T08:38:37&rangeDateEnd=2024-04-01T23:38:34&symbols[]=BTC/USDT&exchangeNames[]=Binance&exchangeNames[]=Bybit&exchangeNames[]=OKX&timeframeMinutes=60"
```

**Example Response Payload:**

```json
{
    "data": {
        "timeframeMinutes": 60,
        "rangeDateStart": "2024-04-01 08:38:37",
        "rangeDateEnd": "2024-04-01 23:38:34",
        "exchangeNames": [
            "Binance",
            "Bybit",
            "OKX"
        ],
        "pairs": [
            {
                "symbol": "BTC/USDT",
                "processedCount": 891,
                "count": 2,
                "candles": [
                    {
                        "timestamp": 1711960717000,
                        "open": 69565.8,
                        "high": 69616.65,
                        "low": 69429.72,
                        "close": 69495,
                        "volume": 807.9433083799998,
                        "aggregatedAveragePrice": 69523.185
                    },
                    {
                        "timestamp": 1711964317000,
                        "open": 69491.8,
                        "high": 69539.8,
                        "low": 69346.7,
                        "close": 69350.1,
                        "volume": 1030.372812450003,
                        "aggregatedAveragePrice": 69443.25
                    }
                ]
            }
        ]
    },
    "status": 1
}
```

## Request Discrete Candle Sticks Aggregation

- **Method**: POST
- **Endpoint**: `/api/v1/crypto/candle-sticks/aggregate-discrete`
- **Body**:
    - `rangeDateStart`: (string) The start date and time of the requested data range.
    - `rangeDateEnd`: (string) The end date and time of the requested data range.
    - `symbols`: (array of strings) The list of cryptocurrency pair symbols (e.g. "BTC/USDT").
    - `exchangeNames`: (array of strings) The list of exchange names from which the data is to be aggregated (e.g. "Binance", "Bybit", "OKX").
    - `timeframeMinutes`: (integer) The time frame in minutes for each candlestick data point.

**Description:**

This endpoint queues an asynchronous job to aggregate discrete candlestick data for specified cryptocurrency pairs from multiple exchanges within a given date and time range. The task is offloaded to a worker for processing. Clients can poll the task status using the `/api/v1/crypto/aggregation-tasks/:id` endpoint and retrieve the results upon completion with the `/api/v1/crypto/candle-sticks/aggregate-discrete/results/:id` endpoint.

**Example with curl:**

```bash
curl -X POST "http://example.com/api/v1/crypto/candle-sticks/aggregate-discrete" \
-H "Content-Type: application/json" \
-d '{
    "rangeDateStart": "2024-04-01 08:38:37",
    "rangeDateEnd": "2024-04-01 23:38:34",
    "symbols": ["BTC/USDT"],
    "exchangeNames": ["Binance", "Bybit", "OKX"],
    "timeframeMinutes": 60
}'
```

**Example Response Payload:**

```json
{
    "data": {
        "id": "2",
        "type": "CANDLES_DISCRETE_AGGREGATION",
        "status": "PENDING",
        "context": {
            "symbols": [
                "BTC/USDT"
            ],
            "exchangeNames": [
                "Binance",
                "Bybit",
                "OKX"
            ],
            "rangeDateStart": "2024-04-01 08:38:37",
            "rangeDateEnd": "2024-04-01 23:38:34",
            "timeframeMinutes": 60
        },
        "error": null,
        "createdAt": "2024-04-05T08:44:45.804Z",
        "updatedAt": "2024-04-05T08:44:45.804Z"
    },
    "status": 1
}
```

**Note:**
To check the status of the aggregation task, replace `:id` with the actual task ID in the `/api/v1/crypto/aggregation-tasks/:id` endpoint. Once the task is complete, the results can be retrieved in a similar manner using the `/api/v1/crypto/candle-sticks/aggregate-discrete/results/:id` endpoint, again replacing `:id` with the task ID.

## Get Discrete Aggregation Task Results

- **Method**: GET
- **Endpoint**: `/api/v1/crypto/candle-sticks/aggregate-discrete/results/:id`
- **Parameters**:
    - `id`: (string) The identifier of the discrete aggregation task.

**Description:**

The `/api/v1/crypto/candle-sticks/aggregate-discrete/results/:id` endpoint is used to retrieve the results of a discrete candle sticks aggregation task. The task is identified using the `id` path variable, which corresponds to the unique ID returned when the aggregation task was initially requested and processed.

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/candle-sticks/aggregate-discrete/results/2"
```

**Example Response Payload:**

```json
{
    "data": {
        "task": {
            "id": "2",
            "type": "CANDLES_DISCRETE_AGGREGATION",
            "status": "COMPLETED",
            "context": {
                "symbols": [
                    "BTC/USDT"
                ],
                "exchangeNames": [
                    "Binance",
                    "Bybit",
                    "OKX"
                ],
                "rangeDateStart": "2024-04-01 08:38:37",
                "rangeDateEnd": "2024-04-01 23:38:34",
                "timeframeMinutes": 60
            },
            "error": null,
            "createdAt": "2024-04-05T08:44:45.804Z",
            "updatedAt": "2024-04-05T08:44:46.000Z"
        },
        "results": [
            {
                "id": "2",
                "symbol": "BTC/USDT",
                "rangeDateStart": "2024-04-01T08:38:37.000Z",
                "rangeDateEnd": "2024-04-01T23:38:34.000Z",
                "timeframeMinutes": 60,
                "processedCount": 891,
                "count": 2,
                "candles": [
                    {
                        "timestamp": 1711960717000,
                        "open": 69565.8,
                        "high": 69616.65,
                        "low": 69429.72,
                        "close": 69495,
                        "volume": 807.9433083799998,
                        "aggregatedAveragePrice": 69523.185
                    },
                    {
                        "timestamp": 1711964317000,
                        "open": 69491.8,
                        "high": 69539.8,
                        "low": 69346.7,
                        "close": 69350.1,
                        "volume": 1030.372812450003,
                        "aggregatedAveragePrice": 69443.25
                    }
                ],
                "taskId": "2",
                "createdAt": "2024-04-05T08:44:45.983Z"
            }
        ]
    },
    "status": 1
}
```

## List Discrete Aggregation Task Results

- **Method**: GET
- **Endpoint**: `/api/v1/crypto/candle-sticks/aggregate-discrete/results`
- **Query**:
    - `limit`: (integer) The maximum number of results to retrieve.
    - `offset`: (integer) The number of results to skip (typically for pagination).
    - `rangeDateStart`: (string) The start date and time for filtering the results.
    - `rangeDateEnd`: (string) The end date and time for filtering the results.
    - `symbols[]`: (array) Filter for the list of cryptocurrency pair symbols (e.g., BTC/USDT).
    - `exchangeNames[]`: (array) Filter for the list of exchange names from which the data is to be retrieved.
    - `timeframeMinutes[]`: (array) The time frames in minutes to filter the candlestick data.

**Description:**

The `/api/v1/crypto/candle-sticks/aggregate-discrete/results` endpoint is designed to list aggregated candlestick data results based on specified query parameters. Clients can filter results by date range, symbols, exchange names, and candlestick time frames.

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/candle-sticks/aggregate-discrete/results?limit=1&offset=0&rangeDateStart=2024-04-01T08:38:37&rangeDateEnd=2024-04-01T23:38:34&symbols[]=BTC/USDT&exchangeNames[]=Binance&exchangeNames[]=Bybit&exchangeNames[]=OKX&timeframeMinutes[]=60"
```

**Example Response Payload:**

```json
{
    "data": [
        {
            "id": "1",
            "symbol": "BTC/USDT",
            "rangeDateStart": "2024-04-01T08:38:37.000Z",
            "rangeDateEnd": "2024-04-01T23:38:34.000Z",
            "timeframeMinutes": 60,
            "processedCount": 891,
            "count": 2,
            "candles": [
                {
                    "timestamp": 1711960717000,
                    "open": 69565.8,
                    "high": 69616.65,
                    "low": 69429.72,
                    "close": 69495,
                    "volume": 807.9433083799998,
                    "aggregatedAveragePrice": 69523.185
                },
                {
                    "timestamp": 1711964317000,
                    "open": 69491.8,
                    "high": 69539.8,
                    "low": 69346.7,
                    "close": 69350.1,
                    "volume": 1030.372812450003,
                    "aggregatedAveragePrice": 69443.25
                }
            ],
            "taskId": "1",
            "createdAt": "2024-04-04T08:30:10.323Z"
        },
        // Additional results here...
    ],
    "status": 1
}
```

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main documentation](../../../README.md)
