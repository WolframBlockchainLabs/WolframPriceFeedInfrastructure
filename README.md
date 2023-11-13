# CCDB Application

## Table of Contents
1. [Features](#features)
2. [Supported Data Types](#supported-data-types)
3. [Data Retrieval](#data-retrieval)
4. [Architecture & Integrations](#architecture--integrations)
5. [Getting Started](#getting-started)
6. [Configuration Guides](#configuration-guides)
7. [CEX & DEX Collectors Configuration](#cex--dex-collectors-configuration)

## Features
**CCDB** is a robust data collector that seamlessly launches collectors to acquire and archive data on chosen symbols (_markets_) from various exchanges. It offers:

- Comprehensive support for multiple data types.
- Enhanced user-driven data retrieval.
- Fault-tolerant distributed architecture.
- Deterministic scheduling for rate limit adherence.
- Seamless integration with leading blockchain technologies.

## Supported Data Types
CCDB supports a diverse range of data types:

- 📚 **Order Book**: Real-time buy and sell orders.
- 🔄 **Trade**: Information on executed transactions.
- 🏷️ **Ticker**: Current market statistics.
- 🕯️ **Candlestick**: Price movement over time.
- 💹 **Exchange Rate**: Current currency conversion rates.

## Data Retrieval
- 🔍 **User-Driven Data Access**: Data retrieval within user-defined ranges.
- 📅 **Historical Data**: Access to data over specific time intervals.

## Architecture & Integrations
- 🏛️ **Distributed Architecture**: Ensures resilience and continuous operation.
- ⏱️ **Scheduling**: Maintains API rate limits.
- 🔗 **Blockchain Integrations**:
  
  | Blockchain | Integration |
  |:----------|:------------|
  | [<img src="public/images/cardano.png" alt="Cardano" height="60"/>](https://cardano.org/) | [Cardano (ADA)](https://cardano.org/) |
  | [<img src="public/images/xrpl.png" alt="XRP Ledger" height="60"/>](https://xrpl.org/index.html) | [XRP Ledger (XRPL)](https://xrpl.org/index.html) |
  | [<img src="public/images/tezos.jpg" alt="Tezos" height="60"/>](https://tezos.com/) | [Tezos (XTZ)](https://tezos.com/) |
  | [<img src="public/images/ethereum.png" alt="Ethereum" height="60"/>](https://ethereum.org/) | [Ethereum (ETH)](https://ethereum.org/) |

## Getting Started
- 🚀 [Quick Start Guide](docs/quick-start.md)
- 📐 [Structure Information](docs/structure.md)

## Configuration Guides
- ⚙️ [System Config](docs/config/system.md)

## CEX & DEX Collectors Configuration

| Type | Logo | Configuration |
|:----:|:----:|:--------------|
| CEXs | [<img src="public/images/ccxt.jpeg" alt="CCXT" height="60"/>](https://docs.ccxt.com/) | [CCXT Collectors Config](docs/config/ccxt-collectors.md) |
| DEXs | [<img src="public/images/cardano.png" alt="Cardano" height="60"/>](https://cardano.org/) | [Cardano Collectors Config](docs/config/cardano-collectors.md) |
| DEXs | [<img src="public/images/ethereum.png" alt="Ethereum" height="60"/>](https://ethereum.org/) | [Ethereum Collectors Config](docs/config/eth-collectors.md) |
| DEXs | [<img src="public/images/tezos.jpg" alt="Tezos" height="60"/>](https://tezos.com/) | [Tezos Collectors Config](docs/config/tezos-collectors.md) |
| DEXs | [<img src="public/images/xrpl.png" alt="XRP Ledger" height="60"/>](https://xrpl.org/index.html) | [XRP Ledger Collectors Config](docs/config/xrpl-collectors.md) |
