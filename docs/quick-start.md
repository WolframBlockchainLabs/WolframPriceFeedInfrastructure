## Required

1. **Node.js®** version not lower than v. 18;

2. **docker-cli (_demon_)** to run docker environment;

## Setup

1. Make sure the docker daemon is running

2. In the root directory copy .env.example into .env and change parameters if needed

3. From the ./docker/env/_example directory copy .env.*example* files into ./docker/env/ and change parameters if needed

4. Run `./scripts/build` to build container images

5. Run `./scripts/start` to start containers

6. Run `npm run docker:migration:db` which will create the necessary entities in the database;

7. After running migrations, use `npm run docker:workers:collectors-seeder:start` which will create preconfigured exchanges in the database (_Binance, Kraken, Gemini, Kucoin and Bitfinex_) and others depending on collectors config;

8. To rollback migrations use `npm run docker:migration:rollback:db`;

9. To stop the service use `./scripts/stop` command.

## Testing

1. Run `./scripts/start`;
2. Run `npm run docker:migration:test`;
3. Run `npm run docker:test:ava` or `npm run docker:test:coverage` to get report on covered lines and branches.

---

 🟣 [Back to main doc file](../README.md)
