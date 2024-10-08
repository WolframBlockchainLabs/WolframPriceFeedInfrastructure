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

**ATTENTION!** If you have changed the collection configuration, you must perform the **Seed Database** step. If you've changed markets, added new ones, or deleted old ones, you should run the seeders again. Otherwise, the changes will not be applied since the infrastructure uses the database as a source of truth.

To ensure that your configuration changes are properly applied, you need to run the relevant seeder scripts. Below are the available seeder scripts:

- `docker:workers:ccxt-realtime-seeder:start`
- `docker:workers:ccxt-historical-seeder:start`
- `docker:workers:xrpl-seeder:start`
- `docker:workers:udex-seeder:start`
- `docker:workers:collectors-seeder:start`

If you intend to extend or modify the configuration, follow these steps to seed the database and apply your changes:

1. **Update your configuration**: Make the necessary changes to your collection configuration.
2. **Run the appropriate seeder script(s)**: Depending on the type of data you have changed, run the corresponding seeder script from the list above.
3. **Verify changes**: Ensure that the changes have been successfully applied and reflected in the system with available market or exchange list endpoints.

## Running Containers

Ensure the following before running containers:

1. **Setup Completion**: Complete the ```Initial Setup Instructions``` guide, otherwise collectors will fail to launch.
2. **Stopping Containers**: If containers are active, stop them before proceeding.
3. **Local Launch**:
    - Uncomment necessary services in `./docker/docker-compose.yml`.
    - Don't forget to follow YAML indentation rules.
    - There you can find a bunch of commented services with a common root in names: `collectors`. Services for collectors are named like `ccxt-collectors`, `eth-collectors`, etc.
    - The ```replicas: 2``` field indicates replica size. Learn about replica sets in [Fault Tolerance](./architecture/fault_tolerance.md).
4. **Service Configuration**: uncomment only those services that you've provided envs for in `./docker/env/.env.backend`. Some collectors require API keys for nodes and will not work unless keys were provided. Other services could be launched without keys like: CCXT, XRPL, and Tezos based collectos. Ethereum and Cardano will definitely require keys to be passed in envs, because default ones are just stubs and will not work. Look for configuration under `./configs` dir.
5. **Rate Limit Caution**: Ensure your API keys meet the rate limits specified in the `./configs` directory for their respective service config.
6. **Start Containers**: Execute `./scripts/start`.

## Rollback Database

To rollback the database:

1. Use `npm run docker:migration:rollback:db`.
2. Note: This will destroy all data and tables. Migrations and seeders will need to be rerun.

## Stopping the Project

To stop the project:

1. **Attached Mode**: Containers running in attached mode can be stopped with Ctrl + C.
2. **Detached Mode**: Use `./scripts/stop` (or from another terminal for Attached mode) to stop services.

## Testing Procedures

1. Start services with `./scripts/start`.
2. Execute tests using `npm run docker:test:jest` or `npm run docker:test:jest:coverage` for coverage reports.

## Running Historical Collection

Historical collection allows to retrieve historical CandleSticks records from CEX through CCXT API.

Ability to collect historical data is entirely dictated by external exchange. If it does not allow to collect a year old data, then there is no way to get it except negotiating API keys with exchange that will allow this collection if its possible. 

1. Complete the ```Initial Setup Instructions``` guide, otherwise collectors will fail to launch.
2. Start services with `./scripts/start`. It is not necessary to have ccxt-collectors container running. The script will be executed on the main server container.
3. Execute collection script using `npm run docker:cli:ccxt-historical-collectors -- ${startDate} ${endDate}`.

Example: 

`npm run docker:cli:ccxt-historical-collectors -- '2024-02-01 09:45:20+0000' '2024-02-02 09:45:20+0000'`

this command will fetch all CandleSticks for configured pairs under `./configs/ccxt/historical` directory, starting with `'2024-02-01 09:45:20+0000'` and ending with `'2024-02-02 09:45:20+0000'` date.

---

🟣 [Back to main documentation](../README.md)
