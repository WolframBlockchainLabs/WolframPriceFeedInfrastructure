# CCDB Application

## Table of Contents

[**Introduction**](#introduction) · [**Principles**](#foundational-principles) · [**Objectives**](#objectives) · [**Features**](#features) · [**Data Types**](#supported-data-types) · [**Data Retrieval**](#data-retrieval) · [**Architecture**](#architecture--integrations) · [**Getting Started**](#getting-started) · [**Config Guides**](#configuration-guides) · [**Glossary**](#glossary)

## Introduction
Welcome to the CCDB Application, a robust and comprehensive data collector designed for seamless integration with various exchanges and blockchain technologies. This document is a gateway to understanding our application, from its core principles and objectives to its technical configurations.

## Foundational Principles

| Principles   | Description |
|--------------|-------------|
| **Openness** | We commit to transparency and believe in sharing our work with the community to foster innovation and collaboration. |
| **Collaboration** | Collaboration is at the heart of our project. We welcome contributions from all individuals and strive to build a supportive open-source community. |
| **Inclusivity** | We embrace diversity and aim to create an inclusive environment where everyone is encouraged to contribute and participate. |
| **Quality** | Quality is paramount. We are dedicated to delivering high-quality software with a focus on reliability and user-friendliness. |
| **Empowerment** | We empower our community by encouraging ownership and recognizing the contributions that help us grow and improve. |

## Objectives

| Objectives   | Description |
|--------------|-------------|
| **Community Engagement** | To build and nurture a community that values each member's contributions and fosters a collaborative spirit. |
| **Excellence in Software** | To develop reliable and user-friendly open-source software that meets the highest standards of quality and innovation. |
| **Innovation and Research** | To pursue cutting-edge solutions and explore new technologies that advance the project and benefit users. |
| **Project Sustainability** | To create a robust, sustainable open-source project with a clear roadmap for long-term success. |
| **Community Benefit** | To contribute to the broader open-source community and provide educational resources on open-source development and collaboration. |

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

### System Configuration
- ⚙️ [System Config](docs/config/system.md)

### CEX & DEX Collectors Configuration

| Type | Logo | Configuration |
|:----:|:----:|:--------------|
| CEXs | [<img src="public/images/ccxt.jpeg" alt="CCXT" height="60"/>](https://docs.ccxt.com/) | [CCXT Collectors Config](docs/config/ccxt-collectors.md) |
| DEXs | [<img src="public/images/cardano.png" alt="Cardano" height="60"/>](https://cardano.org/) | [Cardano Collectors Config](docs/config/cardano-collectors.md) |
| DEXs | [<img src="public/images/ethereum.png" alt="Ethereum" height="60"/>](https://ethereum.org/) | [Ethereum Collectors Config](docs/config/eth-collectors.md) |
| DEXs | [<img src="public/images/tezos.jpg" alt="Tezos" height="60"/>](https://tezos.com/) | [Tezos Collectors Config](docs/config/tezos-collectors.md) |
| DEXs | [<img src="public/images/xrpl.png" alt="XRP Ledger" height="60"/>](https://xrpl.org/index.html) | [XRP Ledger Collectors Config](docs/config/xrpl-collectors.md) |

## Glossary

Below is a glossary of terms and abbreviations commonly used in this documentation:

| Abbreviation | Description |
|--------------|-------------|
| **API**      | Application Programming Interface, a set of routines, protocols, and tools for building software applications. |
| **CCXT**     | CryptoCurrency eXchange Trading Library, a JavaScript / Python / PHP library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs. |
| **CEX**      | Centralized Exchange, a traditional crypto exchange where the company holds the users' funds. |
| **DEX**      | Decentralized Exchange, a blockchain-based exchange where transactions are peer-to-peer without a central authority. |
| **CCDB**     | Cryptocurrency Database, our application for collecting and managing crypto data. |
| **LP**       | Liquidity Pools, crowdsourced pools of tokens or currencies that lie in a smart contract to facilitate trades on a DEX. |
| **UTXO**     | Unspent Transaction Output, a model used by some blockchains where each transaction starts with coins used in a previous transaction. |
| **Order Book** | A list of buy and sell orders organized by price level for a specific asset. |
| **Trade**    | The exchange of assets between buyers and sellers on an exchange. |
| **Ticker**   | A report of the price for certain cryptocurrencies, updated continuously throughout the trading session. |
| **CandleStick** | A graphical representation of the price movements of an asset over a specific time period. |
| **ExchangeRate** | The value of one currency for the purpose of conversion to another, used within the context of liquidity pools (LPs). |
