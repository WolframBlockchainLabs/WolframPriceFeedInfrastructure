# Aggregation Tasks HTTP API Documentation

## Table of Contents

1. [Get Aggregation Task](#get-aggregation-task)

## Get Aggregation Task

- **Method**: GET
- **Endpoint**: `/api/v1/crypto/aggregation-tasks/:id`
- **Path Variables**:
    - `id`: (string) The identifier of the aggregation task.

**Description:**

This endpoint is used to retrieve the status and context of an asynchronous aggregation task by its unique identifier. It provides the current status of the task, including whether it has been completed, is still in progress, or has encountered any errors.

**Example with curl:**

```bash
curl -X GET "http://example.com/api/v1/crypto/aggregation-tasks/1"
```

**Example Response Payload:**

```json
{
    "data": {
        "id": "1",
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
        "createdAt": "2024-04-04T08:30:10.141Z",
        "updatedAt": "2024-04-04T08:30:10.333Z"
    },
    "status": 1
}
```

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main documentation](../../../README.md)
