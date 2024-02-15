# Infrastructure Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [AMQP Infrastructure](#amqp-infrastructure)
3. [Caching Infrastructure](#caching-infrastructure)
4. [Monitoring Infrastructure](#monitoring-infrastructure)
5. [Chista Infrastructure](#chista-infrastructure)
6. [Config Bundlers](#config-bundlers)
7. [Ioredis Client](#ioredis-client)
8. [Logger](#logger)
9. [CLS Namespaces](#cls-namespaces)
10. [Sequelize ORM](#sequelize-orm)
11. [Conclusion](#conclusion)

---

## Introduction
The `infrastructure` directory forms the backbone of the system, providing foundational services such as messaging, caching, logging, and monitoring. These services are crucial for enabling communication between different parts of the application, maintaining performance, and monitoring system health.

## AMQP Infrastructure

### AMQPClient

AMQPClient is a class that defines method for initiating and destroying a connection to `rabbitmq`. It also provides simplified methods for publishing and broadcasting messages.

## Caching Infrastructure

### RedisLRUCache
`RedisLRUCache` implements an LRU (Least Recently Used) cache using Redis, providing a fast and efficient way to store and retrieve data.

- **Cache Management**: Adds, retrieves, and removes items from the cache while ensuring it does not exceed the specified size.
- **Namespace Isolation**: Uses a namespace for keys to prevent collisions and maintain organized storage.
- **Automatic Eviction**: Evicts the least recently used items once the cache reaches its size limit.

By caching frequently accessed data, the application can reduce latency and load on the database, resulting in improved performance.

## Chista Infrastructure
The Chista infrastructure provides a base for service classes, offering a structured way to implement business logic following the Clean Architecture principles. It includes exception handling and module management to streamline application services.

## Config Bundlers
Config bundlers consolidate various JSON configuration files from the `config` directory into a single object. They validate configurations using the `confme` library to ensure the application's settings are consistent and correct.

Config bundlers are typically invoked during application initialization to compile and validate configurations before runtime.

## Ioredis Client
The `ioredis` directory contains a client that manages the lifecycle of connections from the `ioredis` library, a robust Redis client for Node.js.

The `ioredis` client ensures that Redis connections are established when the application starts and are gracefully closed when the application shuts down.

## Logger
The logger infrastructure uses `winston`, a versatile logging library for Node.js. It is configured here to capture and format logs consistently across the application.

### Components
- `formatters`: Custom formatting for log output.
- `winstonLoggerFactory.js`: Initializes the `winston` logger.
- `winstonTransportFactory.js`: Creates transports for logging to different outputs.

## CLS Namespaces
Continuation Local Storage (CLS) namespaces are defined to maintain context across async operations, ensuring that contextual information like request traceIds can be accessed throughout the lifecycle of a request.

## Sequelize ORM
Sequelize ORM setup involves initializing Sequelize instances and loading models. It enables object-relational mapping to interact with the database using JavaScript objects and methods.

- `initModels.js`: A function to initialize Sequelize models and associate them accordingly.

## Conclusion
The infrastructure layer is designed to support the application's non-functional requirements, such as messaging, caching, and monitoring. It plays a vital role in ensuring the application's reliability, scalability, and observability.

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main doc file](../../README.md)

