# Database Writer Microservice Documentation

<img src="../../public/images/architecture/database_writer.png" alt="Database Writer Schema" height="500"/>

## Table of Contents
1. [Overview](#overview)
   - [Introduction](#introduction)
   - [System Context](#system-context)
2. [Technical Details](#technical-details)
   - [Architecture](#architecture)
   - [Core Functionality](#core-functionality)
   - [Logging and Monitoring](#logging-and-monitoring)
   - [Error Handling and Reliability](#error-handling-and-reliability)
3. [Deployment and Scalability](#deployment-and-scalability)
   - [Deployment Strategy](#deployment-strategy)
   - [Compatibility and Interoperability](#compatibility-and-interoperability)
4. [Conclusion](#conclusion)

## Overview

### Introduction
The Database Writer Microservice is a key component in the trading data infrastructure, focused on the archival and processing of market data from Exchange Data Collectors into a structured format, ensuring data integrity and system reliability.

### System Context
This service acts as a critical link between real-time data collection and long-term storage, interfacing with Exchange Data Collectors and the database, ensuring seamless data flow and management.

## Technical Details

### Architecture
- Inherits from `BaseAMQPWorker`, providing sophisticated message queue management.
- Integrates Sequelize for Object-Relational Mapping for effective database interactions.
- Utilizes an AMQP client for efficient message handling in distributed systems.

### Core Functionality
- **Data Reception**: Listens continuously to designated message queues for new data.
- **Data Processing and Validation**:
  - Uses `intervalStart` and `intervalEnd` as idempotency tokens to avoid data duplication.
  - Validates `marketId` for accurate data categorization.
- **Database Interaction**:
  - Uses `findOrCreate` to prevent duplicate entries.
  - Employs transactional operations for data consistency.
- **Data Publication**:
  - Publishes to `WS_PRICING_QUEUE` post successful storage for further processing.

### Logging and Monitoring
- Extensive logging of operations, including data reception, validation, storage, and publication.
- Detailed context logs for troubleshooting and audit trails.

### Error Handling and Reliability
- Strong error handling to maintain system resilience.
- Implements retries for failed message processing to ensure data integrity and continuity.

## Deployment and Scalability

### Deployment Strategy
- Containerized deployment for scalability and consistent environments.
- Supports horizontal scaling to accommodate fluctuating data volumes.

### Compatibility and Interoperability
- Data source agnostic, compatible with various Exchange Data Collectors.
- Flexible to accommodate evolving database schemas.

## Conclusion

The Database Writer Microservice is crucial in our data architecture, providing efficient, reliable, and secure market data handling. Its sophisticated design and comprehensive features make it essential for upholding the integrity and availability of vital trading data.

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main doc file](../../README.md)
