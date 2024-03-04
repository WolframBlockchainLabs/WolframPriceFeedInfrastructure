# Tickers HTTP API Documentation

## Table of Contents

1. [Get List of Tickers](#get-list-of-tickers)

## Get List of Tickers

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/tickers`
-   **Query**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

**Description:**

The /api/v1/crypto/tickers endpoint provides a snapshot of the latest trading metrics for cryptocurrency trading pairs on specified exchanges. It delivers key market indicators such as high, low, bid, ask, volume-weighted average price (vwap), open, close, last price, previous close, change, percentage change, average price, base volume, and quote volume. These data points are crucial for traders and analysts to gauge the current market conditions, assess volatility, and make informed decisions. The endpoint supports queries by date range, exchange names, and symbols, facilitating targeted data retrieval for analysis or display. Through pagination parameters (offset, limit), users can efficiently navigate through large datasets, ensuring access to relevant market data tailored to their specific requirements.

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/tickers?offset=0&limit=5&rangeDateStart=2023-12-11T15:26:00.000Z&rangeDateEnd=2023-12-11T15:31:00.000Z&exchangeNames[]=Binance&symbol=BTC/USDT"
```

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

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main documentation](../../../README.md)
