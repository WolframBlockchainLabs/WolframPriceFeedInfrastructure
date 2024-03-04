# OrderBooks HTTP API Documentation

## Table of Contents

1. [Get List of OrderBooks](#get-list-of-orderbooks)

## Get List of OrderBooks

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/orderBooks`
-   **Query**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `rangeDateStart`: (string) Start date of the range.
    -   `rangeDateEnd`: (string) End date of the range.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `symbol`: (string) Trading pair symbol (e.g. BTC/USDT).

**Description:**

The /api/v1/crypto/orderBooks endpoint fetches real-time or historical order book data for specified cryptocurrency trading pairs from various exchanges. An order book is a list of buy (bids) and sell (asks) orders organized by price level and is essential for understanding market depth and liquidity. This endpoint provides detailed insights into market sentiment and potential price movements by returning the bids and asks at different price levels for selected intervals. It supports fine-tuned queries with parameters for pagination (offset, limit), time range (rangeDateStart, rangeDateEnd), exchange filters (exchangeNames[]), and specific trading pairs (symbol).

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/orderBooks?offset=0&limit=2&rangeDateStart=2023-12-11T15:25:00.000Z&rangeDateEnd=2023-12-11T15:27:00.000Z&exchangeNames[]=Binance&symbol=BTC/USDT"
```

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

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main documentation](../../../README.md)
