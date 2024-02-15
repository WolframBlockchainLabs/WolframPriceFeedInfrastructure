# Workers and Providers Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Workers Directory Structure](#workers-directory-structure)
3. [Provider Classes](#provider-classes)
4. [Worker Classes](#worker-classes)
5. [Database Writer](#database-writer)
6. [Design Principles](#design-principles)
7. [Running Workers](#running-workers)

---

## Introduction
This document serves as a guide for understanding the workers and providers in the `workers` directory of our project. It explains the architectural design, the purpose of each class, and how these components interact to perform tasks within the application.

## Workers Directory Structure
The `workers` directory is composed of several subdirectories, each corresponding to a specific type of worker or task:

- `database-writer`: Contains workers for writing various types of market data into the database.
- `seeders`: Holds workers that seed the database with initial data for different blockchains and collectors.

## Provider Classes
Providers are classes designed to set up the environment, instantiate dependencies, and maintain the main process. They act as a context for the worker tasks to execute within.

- `AppAMQPProvider`: Sets up AMQP consumers based on provided configurations and manages their lifecycle.
- `AppWorkerProvider`: Manages a worker, handling its execution either directly or at regular intervals.

## Worker Classes
Workers are tasks that perform specific actions, such as processing data or responding to events.

- `BaseAMQPWorker`: An abstract worker that handles AMQP messaging, including consuming messages, processing data, and retry logic.
- `BaseWorker`: The foundational worker class that provides common functionality such as transaction handling and error logging.

## Database Writer

The `database-writer` directory contains workers responsible for writing market data to the database. The core functionality of these workers is derived from the `BaseAMQPWorker` class.

### BaseMarketRecordWriter
`BaseMarketRecordWriter` is a specialized worker that extends `BaseAMQPWorker`. Its primary role is to write market records into the database and publish new records to a specified RabbitMQ queue.

- **execute Method**: This method performs the actual data writing logic. It takes market data (`exchange`, `symbol`, `payload`, and `collectorTraceId`) and either creates a new record or identifies an existing one.
- **Record Creation**: If a new record is created, it is also published to the `WS_PRICING_QUEUE` to notify other system components of the new data.
- **Logging**: The worker logs detailed information about the process, including whether a record was created or found, along with contextual data like the time interval and market ID.

### [DataType]Writer
`[DataType]Writer` is a concrete implementation of `BaseMarketRecordWriter` tailored for specific datatype.

- **SequelizeModel**: It specifies datatype as the Sequelize model, for example `CandleStick`, which represents the table where candlestick data is stored.
- **type**: This worker defines its type using `COLLECTOR_TYPES_DICT.[DataType]`, indicating it handles specific datatype.

These writers are integral to the system's data handling, ensuring that market data is accurately recorded and available for further processing or real-time distribution to other services or clients.

To get more info about its role in CCDB architecture follow the link:

🟢 [Read More](../architecture/database_writer.md)

## Design Principles
- **Daemon Workers**: Continuously running workers like `database-writer` listen for events and perform ongoing tasks.
- **Finite Scripts**: Seeders are scripts that populate the database with initial data and are expected to terminate once their task is complete.
- **Providers as Context Managers**: Providers instantiate and manage workers, ensuring that all necessary resources are properly set up and disposed of.
- **Separation of Concerns**: Providers and workers have distinct responsibilities, promoting maintainability and scalability.

## Running Workers
To run a worker, you would typically invoke it through a script that ensures all dependencies are correctly provisioned by the provider. For instance:

```sh
node --max-old-space-size=8192 ./lib/workers/database-writer/worker.js
```

This command would initiate the `MetricsExporter` worker with the specified memory allocation, allowing it to export metrics efficiently.

There are corresponding [NPM Scripts](./npm-scripts-setup.md) for each worker.

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main doc file](../../README.md)
