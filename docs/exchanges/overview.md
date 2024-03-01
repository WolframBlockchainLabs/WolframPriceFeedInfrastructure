# Exchanges Integration Documentation

## Table of Contents

-   [CEX (CCXT)](#cex-ccxt)
    -   [CEX Introduction](#cex-introduction)
    -   [CEX Data Types Collected](#cex-data-types-collected)
    -   [CEX Integrations Table](#cex-integrations-table)
-   [DEX (UDEX)](#dex-udex)
    -   [UDEX Introduction](#udex-introduction)
    -   [UDEX Data Types Collected](#udex-data-types-collected)
    -   [UDEX Integrations Table](#udex-integrations-table)
-   [DEX (XRPL)](#dex-xrpl)
    -   [XRPL Introduction](#xrpl-introduction)
    -   [XRPL Data Types Collected](#xrpl-data-types-collected)
    -   [XRPL Integrations Table](#xrpl-integrations-table)

---

## CEX (CCXT)

### CEX Introduction

Centralized Exchanges (CEX) are platforms where cryptocurrencies and other digital assets can be traded in a controlled environment. The CCXT library is a powerful tool used for connecting and trading with various centralized exchanges through a unified API. This section details the integration with CEX platforms using CCXT, focusing on the data types collected from these exchanges.

### CEX Data Types Collected

-   **OrderBooks**: Provides a real-time snapshot of the order book for a specific trading pair, including information on buy and sell orders.
-   **Tickers**: Offers the latest trading statistics for a particular trading pair, such as the last trade price, 24-hour volume, and price change.
-   **Trades**: Contains data on individual trades that have occurred, including price, volume, and time.
-   **CandleSticks**: Utilized for charting and analysis, this data represents market movements over a specified period, showing the open, high, low, and close prices.

### CEX Integrations Table

| Exchange                                                                                     | Reference                             |
| :------------------------------------------------------------------------------------------- | :------------------------------------ |
| <img src="../../public/images/exchanges/ccxt/binance.png" alt="Binance" height="120"/>       | [Binance](https://www.binance.com/)   |
| <img src="../../public/images/exchanges/ccxt/bitfinex-2.png" alt="Bitfinex" height="120"/>   | [Bitfinex](https://www.bitfinex.com/) |
| <img src="../../public/images/exchanges/ccxt/bitget.png" alt="Bitget" height="120"/>         | [Bitget](https://www.bitget.com/)     |
| <img src="../../public/images/exchanges/ccxt/bitstamp.jpg" alt="Bitstamp" height="120"/>     | [Bitstamp](https://www.bitstamp.net/) |
| <img src="../../public/images/exchanges/ccxt/bybit.png" alt="Bybit" height="120"/>           | [Bybit](https://www.bybit.com/)       |
| <img src="../../public/images/exchanges/ccxt/gate.io_logo.png" alt="Gate.io" height="120"/>  | [Gate.io](https://www.gate.io/)       |
| <img src="../../public/images/exchanges/ccxt/gemini.png" alt="Gemini" height="120"/>         | [Gemini](https://www.gemini.com/)     |
| <img src="../../public/images/exchanges/ccxt/krakenfx_logo.jpeg" alt="Kraken" height="120"/> | [Kraken](https://www.kraken.com/)     |
| <img src="../../public/images/exchanges/ccxt/kucoin.png" alt="Kucoin" height="120"/>         | [Kucoin](https://www.kucoin.com/)     |
| <img src="../../public/images/exchanges/ccxt/okx.png" alt="OKX" height="120"/>               | [OKX](https://www.okx.com/)           |

## DEX (UDEX)

### UDEX Introduction

Decentralized Exchanges (DEX) operate without a central authority, facilitating direct peer-to-peer cryptocurrency transactions. UDEX represents a class of decentralized exchanges. This section outlines the integration with DEX platforms of the UDEX type, specifically focusing on the type of data exchanged.

### UDEX Data Types Collected

-   **ExchangeRates**: Provides information on the current exchange rates between different cryptocurrencies available on UDEX, allowing users to understand the value of their trades.

### UDEX Integrations Table

| Exchange                                                                                                    | Blockchain | Reference                                      |
| :---------------------------------------------------------------------------------------------------------- | :--------- | :--------------------------------------------- |
| <img src="../../public/images/exchanges/udex/cardano/minswap.jpg" alt="MinSwap" height="120"/>              | Cardano    | [MinSwap](https://minswap.org/)                |
| <img src="../../public/images/exchanges/udex/cardano/muesliswap.jpg" alt="MuesliSwap" height="120"/>        | Cardano    | [MuesliSwap](https://muesliswap.com/)          |
| <img src="../../public/images/exchanges/udex/cardano/sundaeswap.png" alt="SundaeSwap" height="120"/>        | Cardano    | [SundaeSwap](https://sundaeswap.finance/)      |
| <img src="../../public/images/exchanges/udex/cardano/vy_finance.png" alt="VyFinance" height="120"/>         | Cardano    | [VyFinance](https://vyfi.io/)                  |
| <img src="../../public/images/exchanges/udex/cardano/wingriders.jpg" alt="WingRiders" height="120"/>        | Cardano    | [WingRiders](https://wingriders.com/)          |
| <img src="../../public/images/exchanges/udex/ethereum/sushiswap.png" alt="SushiSwap" height="120"/>         | Ethereum   | [SushiSwap](https://sushi.com/)                |
| <img src="../../public/images/exchanges/udex/ethereum/uniswap_v2.png" alt="Uniswap V2" height="120"/>       | Ethereum   | [Uniswap V2](https://v2.info.uniswap.org/)     |
| <img src="../../public/images/exchanges/udex/ethereum/uniswap_v3.jpg" alt="Uniswap V3" height="120"/>       | Ethereum   | [Uniswap V3](https://uniswap.org/)             |
| <img src="../../public/images/exchanges/udex/tezos/plenty.png" alt="Plenty" height="120"/>                  | Tezos      | [Plenty](https://plentydefi.com/)              |
| <img src="../../public/images/exchanges/udex/tezos/quipuswap.jpg" alt="Quipuswap Stableswap" height="120"/> | Tezos      | [Quipuswap Stableswap](https://quipuswap.com/) |
| <img src="../../public/images/exchanges/udex/tezos/quipuswap.jpg" alt="Quipuswap v2" height="120"/>         | Tezos      | [Quipuswap v2](https://quipuswap.com/)         |

## DEX (XRPL)

### XRPL Introduction

The XRP Ledger (XRPL) is a decentralized cryptographic ledger powered by a network of peer-to-peer servers. It supports decentralized exchange features directly within its ledger. This section explains the integration with the decentralized exchange features of the XRPL, emphasizing the data type collected.

### XRPL Data Types Collected

-   **OrderBooks**: Similar to CEX, the XRPL's decentralized nature also allows for the collection of order book data, which includes buy and sell orders for trading pairs within the XRPL ecosystem.

### XRPL Integrations Table

| Exchange                                                                         | Reference                 |
| :------------------------------------------------------------------------------- | :------------------------ |
| <img src="../../public/images/exchanges/xrpl/xrpl.jpg" alt="XRPL" height="120"/> | [XRPL](https://xrpl.org/) |

---

🟣 [Back to main doc file](../../README.md)
