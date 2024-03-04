# Markets HTTP API Documentation

## Table of Contents

1. [Get List of Markets](#get-list-of-markets)

## Get List of Markets

-   **Method**: GET
-   **Endpoint**: `/api/v1/crypto/markets`
-   **Query**:
    -   `offset`: (integer) Pagination offset.
    -   `limit`: (integer) Number of records to return.
    -   `exchangeNames[]`: (array) List of exchange names (e.g. Binance).
    -   `tokenSymbols`: (string) Token symbol (e.g. BTC).

**Description:**

The /api/v1/crypto/markets endpoint serves to provide a comprehensive list of cryptocurrency markets available across various exchanges. It supports filtering based on several query parameters such as pagination offsets (offset), limits (limit), specific exchange names (exchangeNames[]), and token symbols (tokenSymbols).

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/markets?offset=0&limit=5&exchangeNames[]=Kraken&tokenSymbols=BTC"
```

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

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main documentation](../../../README.md)
