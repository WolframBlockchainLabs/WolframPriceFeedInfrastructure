# NPM Scripts Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Running the Application](#running-the-application)
3. [Collector Scripts](#collector-scripts)
4. [Worker Scripts](#worker-scripts)
5. [Testing Scripts](#testing-scripts)
6. [Database Migration Scripts](#database-migration-scripts)
7. [Docker Utility Scripts](#docker-utility-scripts)
8. [Formatting and Linting](#formatting-and-linting)
9. [How to Run Scripts](#how-to-run-scripts)

---

## Introduction
This document describes the various `npm` scripts configured in the project's `package.json`. These scripts automate tasks such as running the application, executing tests, performing database migrations, and managing Docker containers.

## Running the Application
- `start`: Runs the application with increased memory allocation.
- `nodemon`: Utilizes `nodemon` for live reloading during development, also with increased memory allocation.

## Collector Scripts
Scripts to start various collector services which fetch data from different blockchain platforms and APIs.
- `cli:ccxt-collectors`: Runs CCXT collectors in real-time.
- `cli:ccxt-historical-collectors`: Executes historical data collection for CCXT.
- Other `cli:*` scripts follow a similar pattern for different blockchain platforms such as XRPL, Ethereum, Tezos, and Cardano.

## Worker Scripts
Scripts related to worker processes that handle various background tasks.
- `workers:*:start`: Start individual worker services, each with memory allocation settings.
- `workers:collectors-seeder:start`: Runs all collector seeders scripts in sequence.
- `workers:database-writer:start`: Starts the database writer worker daemon.
- The `:*:nodemon` variants use `nodemon` for development purposes.

## Testing Scripts
Scripts for running linting, auditing, and testing with Jest.
- `test:lint`: Lints the codebase using ESLint.
- `test:audit`: Runs `npm audit` to check for vulnerabilities.
- `test:jest`: Executes Jest tests with logging level set to emergency to silence logs from endpoints in e2e tests.
- `test:jest:watch`: Runs Jest in watch mode.
- `test:jest:coverage`: Generates test coverage reports.
- `test`: Runs both linting and test coverage.
- `test:stress:api`: Executes stress tests using Artillery.
- `test:stress:rabbitmq:start` and `test:stress:rabbitmq:stop`: Manage the RabbitMQ service for stress testing.

## Database Migration Scripts
Scripts to manage Sequelize database migrations.
- `migration:db`: Runs migrations for the main database.
- The `migration:rollback:*` scripts roll back migrations.

## Docker Utility Scripts
Scripts prefixed with `docker:` are used to run the equivalent `npm` scripts inside Docker containers.
- They follow the pattern `docker exec -it <container_name> npm run <script_name>` to execute scripts within a Dockerized environment.

## Formatting and Linting
- `format`: Formats the code using Prettier to maintain a consistent code style.

## How to Run Scripts
To run any of these scripts, use the `npm run <script_name>` command in your terminal. For example:
```
npm run start
```
will start the application with the specified node memory allocation.

---

🔵 [Back to overview doc file](./overview.md)

🟣 [Back to main doc file](../../README.md)
