# Tests Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Testing Strategy](#testing-strategy)
3. [Test Directory Structure](#test-directory-structure)
    - [AppTestProvider.js](#apptestproviderjs)
    - [End-to-End Tests (e2e)](#end-to-end-tests-e2e)
    - [Stress Tests](#stress-tests)
    - [Unit Tests](#unit-tests)
4. [Testing Principles](#testing-principles)
    - [Database Isolation in E2E Tests](#database-isolation-in-e2e-tests)
    - [Stress Testing with Artillery](#stress-testing-with-artillery)
5. [Running Tests](#running-tests)

---

## Introduction
This document provides a comprehensive overview of the testing setup within the `tests` directory. It includes details on end-to-end, stress, and unit testing implementations following the Pijet principles for isolated and reliable testing environments.

## Testing Strategy
The testing framework of the project is built upon Jest for both unit and end-to-end tests, ensuring consistency and maintainability. Artillery.js is employed for stress testing to simulate high load and measure the application's performance under stress.

## Test Directory Structure

### AppTestProvider.js

A main testing class that extends AppProvider and is used to mock, extends and reconfigure main app class.

### End-to-End Tests (e2e)
The `e2e` directory holds tests that simulate user interactions with the application. It ensures that the application behaves correctly as a whole.

- `factories`: Contains data factories for generating test data.
- `stories`: Houses test scripts that represent user stories or test scenarios.
- `AppE2ETestProvider.js`: A utility that provides common functionality for end-to-end tests.
- `TestDBManager.js`: Manages database connections and handles database resets before and after each test run.

### Stress Tests
The `stress` directory contains scripts and configurations for load testing the application using Artillery.

- `scenarios`: Defines various stress test scenarios to be run against the application.
- `seeder`: Includes scripts to seed the database with data before running stress tests.
- `AppStressTestProvider.js`: Provides common functionality for stress tests.
- `ArtilleryRunner.js`: The main entry point to execute the Artillery stress tests.
- `index.test.js`: An index file that may include setup and teardown configurations for stress tests.

### Unit Tests
The `unit` directory includes tests that verify the functionality of individual components or modules.

- `__mocks__`: Contains imported module mocks.
- `api`: Contains unit tests for API endpoints.
- `domain-collectors`: Houses tests specific to domain logic.
- `workers`: Includes tests for background jobs or workers.

## Testing Principles

### Database Isolation in E2E Tests
Database isolation is achieved by allocating a dedicated database for each sequential thread of tests. This principle is crucial for achieving test reliability and avoiding state leakage between tests. The `TestDBManager.js` script is responsible for creating, resetting, and deleting these databases.

### Stress Testing with Artillery
Stress tests are performed using the Artillery.js library, which simulates user traffic to measure how the system behaves under heavy load. These tests are vital for identifying performance bottlenecks and ensuring the application can handle production-level load.

## Running Tests
To run the tests, execute the corresponding script from the root of the project:
- For end-to-end and unit tests: `docker:test:jest`
- For stress tests: `npm run docker:test:stress:api`

Each test type has specific setup and teardown steps that are automatically handled by their respective scripts.

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main doc file](../../README.md)
