# **Use Case: Real-Time Streaming Dashboard via Websocket API**

<img src="../../public/images/use-cases/realtime-dashboard.png" alt="Realtime Dashboard" height="500"/>

## Scenario

The objective is to develop a dashboard that displays **up-to-the-minute market data** for selected cryptocurrency pairs, leveraging the power of our WebSocket API for real-time data streaming.

## Target Pairs

The dashboard will feature real-time updates for the following pairs:

- `ADA-BTC` (Cardano to Bitcoin)
- `XRP-BTC` (Ripple to Bitcoin)
- `XTZ-BTC` (Tezos to Bitcoin)
- `ETH-BTC` (Ethereum to Bitcoin)
- `BTC-USD` (Bitcoin to US Dollar)

## Features

1. **Real-Time Data Streaming:** Instantaneous updates as our server emits pricing events, ensuring a live feed with no need for manual refresh.
   
2. **Multiple Data Types Display:** Showcasing Order Book depths, latest Trades, Ticker information, Candlestick charts, and Exchange Rates.

3. **Customizable Views:** Users can select which pairs to display and customize settings for each data type.

4. **High Performance and Scalability:** Optimized for handling high-frequency data with minimal latency.

5. **User-Friendly Interface:** Easy-to-navigate design for efficient monitoring of different pairs and data types.

## Implementation

Utilizing web technologies compatible with WebSocket connections, the dashboard will subscribe to our server's feeds for the specified pairs, updating the display in real-time as new data arrives.

---

 🟣 [Back to main doc file](../../README.md)
