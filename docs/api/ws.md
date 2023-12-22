# WebSocket API Documentation

## Table of Contents

1. [AggregateOHLCV Event](#aggregateohlcv-event)
2. [\${exchange}-${pair}-Trade Event](#exchange-pair-trade-event)
3. [\${exchange}-${pair}-Ticker Event](#exchange-pair-ticker-event)
4. [\${exchange}-${pair}-OrderBook Event](#exchange-pair-orderbook-event)
5. [\${exchange}-${pair}-CandleStick Event](#exchange-pair-candlestick-event)

## AggregateOHLCV Event

The `AggregateOHLCV` event is emitted every 10 minutes, providing aggregated data for preconfigured currency pairs. The interval could be configured in the [System Config](../config/system.md#aggregateohlcvemitter-settings)

**Example Payload:**

```json
{
    "data": {
        "rangeDateStart": "2023-12-11T14:27:45.901Z",
        "rangeDateEnd": "2023-12-11T14:37:45.901Z",
        "aggregatedPairs": {
            "BTC/EUR": {
                "open": null,
                "high": null,
                "low": null,
                "close": null,
                "volume": null,
                "aggregatedAveragePrice": null
            },
            "BTC/USDT": {
                "open": 41847.2,
                "high": 41958.97,
                "low": 41813.1,
                "close": 41923.435,
                "volume": 1389.9607819399996,
                "aggregatedAveragePrice": 41886.035
            }
        }
    }
}
```

_Note: `null` values indicate no data available for the specified period._

## \${exchange}-${pair}-Trade Event

This event emits Trade data for a specified exchange and currency pair as soon as it is collected.

**Example Payload for binance-BTC/USDT-Trade:**

```json
{
    "exchange": "binance",
    "symbol": "BTC/USDT",
    "payload": {
        "tradesInfo": [
            [1, 42000.03, 0.00058, 1702305540000],
            [1, 42000.03, 0.00054, 1702305540001],
            [1, 42000.03, 0.00113, 1702305540001],
            [1, 42000.03, 0.00232, 1702305540002],
            [1, 42000.03, 0.00227, 1702305540002]
        ],
        "intervalStart": 1702305540000,
        "intervalEnd": 1702305600000,
        "marketId": 69
    },
    "type": "Trade"
}
```

_Note: `\${exchange}` value should be exchange id, not name. Refer to the `./config` folder to find respective ids for names._

## \${exchange}-${pair}-Ticker Event

This event provides Ticker data for a specified exchange and currency pair as soon as it is collected.

**Example Payload for binance-BTC/USDT-Ticker:**

```json
{
    "exchange": "binance",
    "symbol": "BTC/USDT",
    "payload": {
        "high": 44046,
        "low": 40400,
        "bid": 41977,
        "bidVolume": 0.53876,
        "ask": 41977.01,
        "askVolume": 4.80016,
        "vwap": 42501.30907775,
        "open": 43797.46,
        "close": 41977,
        "last": 41977,
        "previousClose": 43797.45,
        "change": -1820.46,
        "percentage": -4.157,
        "average": 42887.23,
        "baseVolume": 53508.02676,
        "quoteVolume": 2274161183.467364,
        "intervalStart": 1702305540000,
        "intervalEnd": 1702305600000,
        "marketId": 69
    },
    "type": "Ticker"
}
```

_Note: `\${exchange}` value should be exchange id, not name. Refer to the `./config` folder to find respective ids for names._

## \${exchange}-${pair}-OrderBook Event

This event provides OrderBook data for a specified exchange and currency pair as soon as it is collected.

**Example Payload for binance-BTC/USDT-OrderBook:**

```json
{
    "exchange": "binance",
    "symbol": "BTC/USDT",
    "payload": {
        "bids": [
            [41977, 0.13294],
            [41976.89, 0.02795],
            [41976.74, 0.11951],
            [41976.73, 0.1],
            [41976.49, 0.00329]
        ],
        "asks": [
            [41977.01, 6.61858],
            [41977.02, 0.00018],
            [41977.08, 0.23832],
            [41977.3, 0.5]
        ],
        "intervalStart": 1702305540000,
        "intervalEnd": 1702305600000,
        "marketId": 69
    },
    "type": "OrderBook"
}
```

_Note: `\${exchange}` value should be exchange id, not name. Refer to the `./config` folder to find respective ids for names._

## \${exchange}-${pair}-CandleStick Event

This event provides CandleStick data for a specified exchange and currency pair as soon as it is collected.

**Example Payload for binance-BTC/USDT-CandleStick:**

```json
{
    "exchange": "binance",
    "symbol": "BTC/USDT",
    "payload": {
        "charts": [
            [1702305540000, 42000.03, 42016.11, 41972.83, 41988.89, 107.70167]
        ],
        "intervalStart": 1702305540000,
        "intervalEnd": 1702305600000,
        "marketId": 69
    },
    "type": "CandleStick"
}
```

_Note: `\${exchange}` value should be exchange id, not name. Refer to the `./config` folder to find respective ids for names._

---

🟣 [Back to main doc file](../../README.md)
