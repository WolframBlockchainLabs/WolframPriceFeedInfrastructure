# HTTP API Documentation

## Table of Contents

1. [Exchange](#exchange)
    - [Get List of Exchanges](#get-list-of-exchanges)
2. [Markets](#markets)
    - [Get List of Markets](#get-list-of-markets)
3. [CandleStick](#candlestick)
    - [Get List of Market's candleSticks](#get-list-of-markets-candlesticks)
    - [Get aggregate Market candleStick](#get-aggregate-market-candlestick)
4. [Exchange Rate](#exchange-rate)
    - [Get List of Market's exchangeRates](#get-list-of-markets-exchangerates)
5. [Order Book](#order-book)
    - [Get List of Market's orderBooks](#get-list-of-markets-orderbooks)
6. [Ticker](#ticker)
    - [Get List of Market's tickers](#get-list-of-markets-tickers)
7. [Trades](#trades)
    - [Get List of Market's trades](#get-list-of-markets-trades)

## Exchange

### Get List of Exchanges

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/exchanges`
-   **Parameters**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.

**Example Response Payload:**

```json
{
    "data": [
        {
            "id": 1,
            "externalExchangeId": "binance",
            "name": "Binance"
        },
        {
            "id": 2,
            "externalExchangeId": "bitfinex",
            "name": "Bitfinex"
        },
        {
            "id": 3,
            "externalExchangeId": "bitget",
            "name": "Bitget"
        },
        {
            "id": 4,
            "externalExchangeId": "bitstamp",
            "name": "Bitstamp"
        },
        {
            "id": 5,
            "externalExchangeId": "bybit",
            "name": "Bybit"
        }
    ],
    "meta": {
        "fetchCount": 5,
        "totalCount": 22
    },
    "status": 1
}
```

## Markets

### Get List of Markets

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/markets`
-   **Parameters**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `tokenNames`: (string) Token symbol (e.g. BTC).

**Example Response Payload:**

```json
{
    "data": [
        {
            "id": 20,
            "externalMarketId": "XBTUSDT",
            "symbol": "BTC/USDT",
            "base": "BTC",
            "quote": "USDT",
            "baseId": "XXBT",
            "quoteId": "USDT",
            "active": true,
            "exchangeId": 8,
            "exchange": {
                "id": 8,
                "externalExchangeId": "kraken",
                "name": "Kraken"
            }
        },
        {
            "id": 21,
            "externalMarketId": "XETHXXBT",
            "symbol": "ETH/BTC",
            "base": "ETH",
            "quote": "BTC",
            "baseId": "XETH",
            "quoteId": "XXBT",
            "active": true,
            "exchangeId": 8,
            "exchange": {
                "id": 8,
                "externalExchangeId": "kraken",
                "name": "Kraken"
            }
        },
        {
            "id": 22,
            "externalMarketId": "ADAXBT",
            "symbol": "ADA/BTC",
            "base": "ADA",
            "quote": "BTC",
            "baseId": "ADA",
            "quoteId": "XXBT",
            "active": true,
            "exchangeId": 8,
            "exchange": {
                "id": 8,
                "externalExchangeId": "kraken",
                "name": "Kraken"
            }
        },
        {
            "id": 23,
            "externalMarketId": "XXRPXXBT",
            "symbol": "XRP/BTC",
            "base": "XRP",
            "quote": "BTC",
            "baseId": "XXRP",
            "quoteId": "XXBT",
            "active": true,
            "exchangeId": 8,
            "exchange": {
                "id": 8,
                "externalExchangeId": "kraken",
                "name": "Kraken"
            }
        },
        {
            "id": 24,
            "externalMarketId": "XTZXBT",
            "symbol": "XTZ/BTC",
            "base": "XTZ",
            "quote": "BTC",
            "baseId": "XTZ",
            "quoteId": "XXBT",
            "active": true,
            "exchangeId": 8,
            "exchange": {
                "id": 8,
                "externalExchangeId": "kraken",
                "name": "Kraken"
            }
        }
    ],
    "meta": {
        "fetchCount": 5,
        "totalCount": 18
    },
    "status": 1
}
```

## CandleStick

### Get List of Market's candleSticks

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/candleSticks`
-   **Parameters**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

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

### Get aggregate Market candleStick

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/candleSticks/aggregate`
-   **Parameters**:
    -   `offset`: (integer) Aggregation offset (skips specified amount of records from the beginning of time frame. Not particularly useful in a common use case, but might be in some complex corner cases).
    -   `limit`: (integer) Number of records to be used in an aggregation round (heavily influences execution time and memory usage. The more records will be aggregated in one round the more memory it will take, but the execution time will be faster because it will take less requests to the database).
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `symbols[]`: (array) List of trading pair symbols (e.g. BTC/USDT).
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).

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

## Exchange Rate

### Get List of Market's exchangeRates

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/exchangeRates`
-   **Parameters**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

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

## Order Book

### Get List of Market's orderBooks

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/orderBooks`
-   **Parameters**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

**Example Response Payload:**

```json
{
    "data": [
        {
            "id": 353997,
            "marketId": 69,
            "bids": [
                [41914.86, 0.05232],
                [41914.66, 0.00215],
                [41914.17, 0.00215]
            ],
            "asks": [
                [41914.87, 8.58644],
                [41914.91, 1.2],
                [41914.96, 0.3669]
            ],
            "createdAt": "2023-12-11T15:27:08.427Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:26:00.000Z",
            "intervalEnd": "2023-12-11T15:27:00.000Z"
        },
        {
            "id": 353953,
            "marketId": 69,
            "bids": [
                [41901.59, 5.39373],
                [41901.56, 0.07154],
                [41901.27, 0.00012]
            ],
            "asks": [
                [41901.6, 0.41075],
                [41901.92, 0.00215],
                [41902, 0.2222]
            ],
            "createdAt": "2023-12-11T15:26:08.360Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:25:00.000Z",
            "intervalEnd": "2023-12-11T15:26:00.000Z"
        }
    ],
    "meta": {
        "fetchCount": 2
    },
    "status": 1
}
```

## Ticker

### Get List of Market's tickers

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/tickers`
-   **Parameters**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

**Example Response Payload:**

```json
{
    "data": [
        {
            "id": 344134,
            "marketId": 69,
            "high": 44046,
            "low": 40400,
            "bid": 41888,
            "bidVolume": 0.58556,
            "ask": 41888.01,
            "askVolume": 4.82067,
            "vwap": 42460.15659669,
            "open": 43925.3,
            "close": 41888.01,
            "last": 41888.01,
            "previousClose": 43925.3,
            "change": -2037.29,
            "percentage": -4.638,
            "average": 42906.655,
            "baseVolume": 55016.28239,
            "quoteVolume": 2335999965.647257,
            "createdAt": "2023-12-11T15:31:10.076Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:30:00.000Z",
            "intervalEnd": "2023-12-11T15:31:00.000Z"
        },
        {
            "id": 344093,
            "marketId": 69,
            "high": 44046,
            "low": 40400,
            "bid": 41914.85,
            "bidVolume": 2.96532,
            "ask": 41914.86,
            "askVolume": 1.26858,
            "vwap": 42461.09235887,
            "open": 43908.52,
            "close": 41914.85,
            "last": 41914.85,
            "previousClose": 43908.52,
            "change": -1993.67,
            "percentage": -4.541,
            "average": 42911.685,
            "baseVolume": 55001.11879,
            "quoteVolume": 2335407584.783334,
            "createdAt": "2023-12-11T15:30:10.043Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:29:00.000Z",
            "intervalEnd": "2023-12-11T15:30:00.000Z"
        },
        {
            "id": 344052,
            "marketId": 69,
            "high": 44046,
            "low": 40400,
            "bid": 41906.02,
            "bidVolume": 2.1586,
            "ask": 41906.03,
            "askVolume": 2.24194,
            "vwap": 42461.68195199,
            "open": 43908.51,
            "close": 41906.02,
            "last": 41906.02,
            "previousClose": 43908.52,
            "change": -2002.49,
            "percentage": -4.561,
            "average": 42907.265,
            "baseVolume": 54980.90588,
            "quoteVolume": 2334581738.908671,
            "createdAt": "2023-12-11T15:29:10.031Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:28:00.000Z",
            "intervalEnd": "2023-12-11T15:29:00.000Z"
        },
        {
            "id": 344011,
            "marketId": 69,
            "high": 44046,
            "low": 40400,
            "bid": 41909.99,
            "bidVolume": 3.4246,
            "ask": 41910,
            "askVolume": 3.05594,
            "vwap": 42462.11725686,
            "open": 43908.52,
            "close": 41910,
            "last": 41910,
            "previousClose": 43908.52,
            "change": -1998.52,
            "percentage": -4.552,
            "average": 42909.26,
            "baseVolume": 54958.37793,
            "quoteVolume": 2333649087.9106207,
            "createdAt": "2023-12-11T15:28:09.958Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:27:00.000Z",
            "intervalEnd": "2023-12-11T15:28:00.000Z"
        },
        {
            "id": 343970,
            "marketId": 69,
            "high": 44046,
            "low": 40400,
            "bid": 41914,
            "bidVolume": 0.48176,
            "ask": 41914.01,
            "askVolume": 6.69781,
            "vwap": 42462.69716168,
            "open": 43912.9,
            "close": 41914,
            "last": 41914,
            "previousClose": 43912.9,
            "change": -1998.9,
            "percentage": -4.552,
            "average": 42913.45,
            "baseVolume": 54955.42437,
            "quoteVolume": 2333555542.4150977,
            "createdAt": "2023-12-11T15:27:09.928Z",
            "exchangeName": "Binance",
            "symbol": "BTC/USDT",
            "intervalStart": "2023-12-11T15:26:00.000Z",
            "intervalEnd": "2023-12-11T15:27:00.000Z"
        }
    ],
    "meta": {
        "fetchCount": 5
    },
    "status": 1
}
```

## Trades

### Get List of Market's trades

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/trades`
-   **Parameters**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

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

🟣 [Back to main documentation](../../README.md)
