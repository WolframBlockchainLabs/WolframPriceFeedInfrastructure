# Exchanges HTTP API Documentation

## Table of Contents

1. [Get List of Exchanges](#get-list-of-exchanges)

## Get List of Exchanges

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/exchanges`
-   **Query**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.

**Description:**

The /api/v1/crypto/exchanges endpoint is designed to retrieve a list of cryptocurrency exchanges. It supports pagination through the use of query parameters, allowing clients to specify the subset of data they wish to receive. This is particularly useful for handling large datasets efficiently.

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/exchanges?offset=0&limit=5"
```

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

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main documentation](../../../README.md)
