# Project Structure Documentation

## Table of Contents

1. [Configs](#1-configs)
2. [Docker](#2-docker)
3. [Documentation](#3-documentation)
4. [Library (Lib)](#4-library-lib)
    - [API](#41-api)
    - [Domain Collectors](#42-domain-collectors)
    - [Domain Model](#43-domain-model)
    - [Infrastructure](#44-infrastructure)
    - [Use Cases](#45-use-cases)
    - [Utilities](#46-utilities)
    - [Workers](#47-workers)
5. [Migrations](#5-migrations)
6. [Node Modules](#6-node-modules)
7. [Public](#7-public)
8. [Scripts](#8-scripts)
9. [Tests](#9-tests)
10. [Environment Files](#10-environment-files)

---

## 1. Configs

This directory hosts `.json` configuration files for the system and individual collectors. These configurations are managed using `confme.js`. Each file's purpose and structure are detailed in the `[Configuration Files]` section.

🟢 [Configuration Files](../../README.md#configuration-guides)

## 2. Docker

The `docker` directory comprises Docker-related configurations. The key file here is `docker-compose.yml`, which outlines the composition of services for the application. These services are containerized and can be initiated using the `npm run docker:up` command.

🟢 [Docker Setup Details](./docker-setup.md)

## 3. Documentation

Documentation-related materials, including architectural overviews and quick-start guides, are located in the `docs` directory. This is where users can find detailed explanations and additional context for understanding and working with the application.

## 4. Library (Lib)

### 4.1 API

The `api` directory contains the `rest-api` and `ws-api` subdirectories:

-   `rest-api` includes middleware, routes, and controllers that handle HTTP requests.
-   `ws-api` defines WebSocket gateways for real-time data streaming.

### 4.2 Domain Collectors

The `collectors` directory encapsulates the logic for data retrieval from various exchanges. It utilizes the CCXT library and comprises collectors like `OrderBookCollector`, `CandleStickCollector`, `TradeCollector`, and `TickerCollector`.

### 4.3 Domain Model

`domain-model` houses Sequelize entities representing the application's data models, such as `Exchange`, `Markets`, `OrderBook`, `CandleStick`, `Ticker`, `ExchangeRate`, and `Trade`.

It also contains definitions of internal Exception models structure. 

### 4.4 Infrastructure

Infrastructure components, including the AMQP client setup and application-wide logger, are found within the `infrastructure` directory.

🟢 [Infrastructure Setup Details](./infrastructure-setup.md)

### 4.5 Use Cases

The `use-cases` directory contains business logic for entity interaction and endpoint data validation.

🟢 [Use Cases Setup Details](./use-cases-setup.md)

### 4.6 Utilities

Utility functions and helpers that are used across the application are located in the `utils` directory.

### 4.7 Workers

`workers` includes service entry points like seeders or database refreshers that run independently of the main application process.

🟢 [Workers Setup Details](./workers-scripts-setup.md)

## 5. Migrations

Database schema changes and data transformations are handled through migration files in the `migrations` directory.

## 6. Node Modules

Dependencies and libraries installed via npm are contained in the `node_modules` directory.

## 7. Public

The `public` directory serves static files, such as images, that are accessible to the client-side of the application.

## 8. Bash Scripts

Supporting scripts for tasks like service administrative operations are found in the `scripts` directory.

🟢 [Bash Scripts Setup Details](./bash-scripts-setup.md)

## 9. NPM Scripts

`package.json` contains a list of scripts defined for tasks like database seeding, migration, and service entrypoints.

🟢 [NPM Scripts Setup Details](./npm-scripts-setup.md)

## 10. Tests

Comprehensive testing is conducted via the `tests` directory, which includes both unit and end-to-end tests to ensure application integrity and reliability.

🟢 [Tests Setup Details](./tests-setup.md)

## 11. Environment Files

The `.env` file, located in the root directory, includes definitions of environment variables for Docker Compose, such as image tags and registry links. On the other hand, the `.env.defaults` file is managed by the Confme JavaScript library and contains the default values for the application's environment variables.

---

🟣 [Back to main doc file](../../README.md)
