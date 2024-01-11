# Project Setup and Management Guide

## Prerequisites

Before setting up the project, ensure the following requirements are met:

-   **Node.js®**: Version 18 or higher.
-   **Docker CLI (Daemon)**: Required to run the Docker environment.

## Initial Setup Instructions

Follow these steps to set up the project:

1. **Docker Daemon**: Verify that the Docker daemon is active.
2. **Environment Variables**:
    - Copy `.env.example` from the root directory to `.env`.
    - Modify parameters as necessary.
    - This file includes variables for Docker Compose configuration such as:
        - `PROJECT_NAME` : project name for compose to manage containers,
        - `BE_REGISTRY_ADDRESS` : address of containers registry that will be used for building and pushing,
        - `BE_TAG` : tag for the image that will be used for building and pushing.
3. **Additional Configuration**:
    - Copy `.env._example_` files from `./docker/env/_example` to `./docker/env/`.
    - Adjust parameters as needed.
    - For more details, refer to [Configuration Guides](../README.md#configuration-guides).
4. **Build Container Images**: Execute `./scripts/build`.
5. **Start Containers**: Execute `./scripts/start`.
6. **Database Migration**: Run `npm run docker:migration:db` to set up necessary database entities.
7. **Seed Database**:
    - Use `npm run docker:workers:collectors-seeder:start` to populate the database with preconfigured exchanges (e.g., Binance, Kraken, Gemini).
    - Refer to collectors config for the full list exchanges and markets.

## Running Containers

Ensure the following before running containers:

1. **Setup Completion**: Complete the setup guide, otherwise collectors will fail to launch.
2. **Stopping Containers**: If containers are active, stop them before proceeding.
3. **Local Launch**:
    - Uncomment necessary services in `./docker/docker-compose.yml`.
    - Don't forget to follow YAML indentation rules.
    - There you can find a bunch of commented services with a common root in names: `collectors`. Services for collectors are named like `ccxt-collectors`, `eth-collectors`, etc.
    - The postfix number in container name indicates its order in the replica set. Learn about replica sets in [Fault Tolerance](./architecture/fault_tolerance.md).
4. **Service Configuration**: uncomment only those services that you've provided envs for in `./docker/env/.env.backend`. Some collectors require API keys for nodes and will not work unless keys were provided. Other services could be launched without keys like: CCXT, XRPL, and Tezos based collectos. Ethereum and Cardano will definitely require keys to be passed in envs, because default ones are just stubs and will not work. Look for configuration under `./configs` dir.
5. **Rate Limit Caution**: Ensure your API keys meet the rate limits specified in the `./configs` directory for their respective service config.
6. **Start Containers**: Execute `./scripts/start`.

## Rollback Database

To rollback the database:

1. Use `npm run docker:migration:rollback:db`.
2. Note: This will destroy all data and tables. Migrations and seeders will need to be rerun.

# Stopping the Project

To stop the project:

1. **Attached Mode**: Containers running in attached mode can be stopped with Ctrl + C.
2. **Detached Mode**: Use `./scripts/stop` (or from another terminal for Attached mode) to stop services.

## Testing Procedures

1. Start services with `./scripts/start`.
2. Run database migration tests with `npm run docker:migration:test`.
3. Execute tests using `npm run docker:test:jest` or `npm run docker:test:jest:coverage` for coverage reports.

---

🟣 [Back to main documentation](../README.md)
