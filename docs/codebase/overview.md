# Project Structure Documentation

## Table of Contents
1. [Configs](#1-configs)
2. [Docker](#2-docker)
3. [Documentation](#3-documentation)
4. [Library (Lib)](#4-library-lib)
   - [API](#41-api)
   - [Collectors](#42-collectors)
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

This directory hosts `.json` configuration files for the system and individual collectors. These configurations are managed using `confme.js`. Each file's purpose and structure are detailed in the [Configuration files](../../README.md#configuration-guides) section.

## 2. Docker

The `docker` directory comprises Docker-related configurations. The key file here is `docker-compose.yml`, which outlines the composition of services for the application. These services are containerized and can be initiated using the `npm run docker:up` command.

## 3. Documentation

Documentation-related materials, including architectural overviews and quick-start guides, are located in the `docs` directory. This is where users can find detailed explanations and additional context for understanding and working with the application.

## 4. Library (Lib)

### 4.1 API

The `api` directory contains the `rest-api` and `ws-api` subdirectories:
- `rest-api` includes middleware, routes, and controllers that handle HTTP requests.
- `ws-api` defines WebSocket gateways for real-time data streaming.

### 4.2 Collectors

The `collectors` directory encapsulates the logic for data retrieval from various exchanges. It utilizes the CCXT library and comprises collectors like `OrderBookCollector`, `CandleStickCollector`, `TradeCollector`, and `TickerCollector`.

### 4.3 Domain Model

`domain-model` houses Sequelize entities representing the application's data models, such as `Exchange`, `Markets`, `OrderBook`, `CandleStick`, `Ticker`, `ExchangeRate`, and `Trade`.

### 4.4 Infrastructure

Infrastructure components, including the AMQP client setup and application-wide logger, are found within the `infrastructure` directory.

### 4.5 Use Cases

The `use-cases` directory contains business logic for entity interaction and endpoint data validation.

### 4.6 Utilities

Utility functions and helpers that are used across the application are located in the `utils` directory.

### 4.7 Workers

`workers` includes service entry points like seeders or database refreshers that run independently of the main application process.

## 5. Migrations

Database schema changes and data transformations are handled through migration files in the `migrations` directory.

## 6. Node Modules

Dependencies and libraries installed via npm are contained in the `node_modules` directory.

## 7. Public

The `public` directory serves static files, such as images, that are accessible to the client-side of the application.

## 8. Scripts

Supporting scripts for tasks like database seeding or administrative operations are found in the `scripts` directory.

## 9. Tests

Comprehensive testing is conducted via the `tests` directory, which includes both unit and end-to-end tests to ensure application integrity and reliability.

## 10. Environment Files

Environment-specific configurations are managed through files like `.env`, which are crucial for defining runtime environment variables.

---

Each section provides an overview of the respective directory's role within the project's ecosystem, ensuring maintainers and developers have a clear understanding of the codebase structure.

---

 🟣 [Back to main doc file](../../README.md)
