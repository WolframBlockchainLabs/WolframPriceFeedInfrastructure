## system.config

### General Settings

-   **projectName**: The name of the project.
    -   Example: `"{{PROJECT_NAME}}"`

#### App Settings

-   **app.port**: The port on which the application will run.
    -   Example: `"{{PORT}}"`
-   **app.testPort**: The port used for testing.
    -   Default: `3002`
-   **app.mode**: The mode in which the application will run (e.g., development, production).
    -   Example: `"{{NODE_ENV}}"`
-   **app.trustProxy**: Trust proxy level for the express (e.g. 1 - trust one proxy). Allows to forward ip and other original request data.
    -   Example: `"{{APP_TRUST_PROXY}}"`
-   **app.cacheEnabled**: Boolean that indicates whether use-case level cache should be enabled.
    -   Example: `"{{APP_CACHE_ENABLED}}"`

#### URLs Settings

-   **urls.self**: URL of the server.
    -   Example: `"{{SELF_URL}}"`
-   **urls.main**: The main URL of the application.
    -   Example: `"{{MAIN_URL}}"`
-   **urls.realtimeDashboard**: URL of the realtime dashboard.
    -   Example: `"{{REALTIME_DASHBOARD_URL}}"`
-   **urls.corsList**: List of URLs separated by comma which should be included in cors policy.
    -   Example: `"{{CORS_URL_LIST}}"`

### Database Settings

#### Main Database

-   **db.username**: The username to connect to the main database.
    -   Example: `"{{DB_USERNAME}}"`
-   **db.password**: The password to connect to the main database.
    -   Example: `"{{DB_PASSWORD}}"`
-   **db.database**: The name of the main database.
    -   Example: `"{{DB_DATABASE}}"`
-   **db.dialect**: The dialect of the main database (e.g., mysql, postgres).
    -   Example: `"{{DB_DIALECT}}"`
-   **db.host**: The host of the main database.
    -   Example: `"{{DB_HOST}}"`
-   **db.port**: The port of the main database.
    -   Example: `"{{DB_PORT}}"`
-   **db.dialectOptions.connectTimeout**: Amount of milliseconds for waiting to establish a connection.
    -   Example: `"{{DB_DIALECT_TIMEOUT}}"`
-   **db.dialectOptions.timezone**: The timezone used for the connection.
    -   Example: `"{{DB_DIALECT_TIMEZONE}}"`
-   **db.pool.min**: The minimum number of connections in the pool.
    -   Example: `"{{DB_POOL_MIN}}"`
-   **db.pool.max**: The maximum number of connections in the pool.
    -   Example: `"{{DB_POOL_MAX}}"`
-   **db.pool.idle**: The maximum time, in milliseconds, that a connection can be idle before being released.
    -   Example: `"{{DB_POOL_IDLE}}"`
-   **db.pool.acquire**: The maximum time, in milliseconds, the pool will try to get a connection before throwing an error.
    -   Example: `"{{DB_POOL_ACQUIRE}}"`
-   **db.pool.evict**: The maximum time, in milliseconds, that a connection can be idle before being evicted from the pool.
    -   Example: `"{{DB_POOL_EVICT}}"`
-   **db.pool.maxUses**: The maximum number of times a connection can be used before being retired.
    -   Example: `"{{DB_POOL_MAX_USES}}"`
-   **db.retry.max**: The maximum number of retry attempts.
    -   Example: `"{{DB_RETRY_MAX}}"`

### Redis Settings

-   **redis.host**: The host of the Redis instance.
    -   Example: `"{{REDIS_HOST}}"`
-   **redis.password**: The password to connect to the Redis instance.
    -   Example: `"{{REDIS_PASSWORD}}"`

### RabbitMQ Settings

-   **rabbitmq.urls**: An array of URLs to connect to RabbitMQ.
    -   Example:
        ```
        [
            "amqp://{{RABBITMQ_USER}}:{{RABBITMQ_PASS}}@{{RABBITMQ_HOST}}:5672/"
        ]
        ```

### Logger Settings

-   **logger.isPlainText**: Flag to determine if the logs should be in plain text format.
    -   Example: `"{{LOGGER_PLAIN_TEXT}}"`
-   **logger.level**: The level of logging (e.g., info, warn, error).
    -   Example: `"{{LOGGER_LEVEL}}"`
-   **logger.transports**: An array of transport objects that define how logs should be transported.
    -   Example:
        ```
        [
            {
                "type": "console",
                "pretty": true
            }
        ]
        ```

### AMQP Worker Settings

-   **amqpWorker.retryLimit**: limit on message processing failure retries
    -   Example: `12`
-   **amqpWorker.retryPeriodMs**: time to wait before next try in milliseconds
    -   Example: `3600000`
-   **amqpWorker.prefetchCount**: Set the prefetch count for this channel. The count given is the maximum number of messages sent over the channel that can be awaiting acknowledgement; once there are count messages outstanding, the server will not send more messages on this channel until one or more have been acknowledged. A falsey value for count indicates no such limit. The server will reply (with an empty object) if successful.
    -   Example: `100`

### Use-Case LRU Cache Settings

-   **useCaseLRUCache.ttl**: Cache record expiration time in milliseconds.
    -   Example: `"{{USE_CASE_LRU_CACHE_TTL}}"`
-   **useCaseLRUCache.maxCacheSize**: The maximum number of items that could be stored in cache.
    -   Example: `"{{USE_CASE_LRU_CACHE_SIZE}}"`

### AggregateOHLCVEmitter Settings

-   **aggregateOHLCVEmitter.interval**: time to wait in milliseconds before emitting next message
    -   Example: `"{{AGGREGATE_OHLCV_EMITTER_INTERVAL}}"`
-   **aggregateOHLCVEmitter.exchanges**: An array exchanges to aggregate pairs from.
    -   Example:
        ```
        [
          "Binance",
          "Bitfinex",
          "Bitget",
          "Bitstamp",
          "Bybit",
          "Gate.io",
          "Gemini",
          "Kraken",
          "KuCoin",
          "OKX"
        ]
        ```
-   **aggregateOHLCVEmitter.pairs**: An array pairs to aggregate OHLCV from.
    -   Example:
        ```
        ["BTC/EUR", "BTC/USDT", "ETH/USDT", "ETH/EUR", "LTC/BTC"]
        ```

### AMQP Policies Settings

#### Policies Common Retry Config

-   **policiesConfigs.retryConfig.retryLimit**: The maximum number of retry attempts for operations.
    -   Example: `"{{AMQP_POLICY_RETRY_LIMIT}}"`
-   **policiesConfigs.retryConfig.retryPeriodMs**: The time in milliseconds between retry attempts.
    -   Example: `"{{AMQP_POLICY_RETRY_PERIOD_MS}}"`

#### Replica Discovery Policy Config

-   **policiesConfigs.replicaDiscovery.initializationDelay**: Initial delay in milliseconds for starting the replica discovery process.
    -   Example: `"{{REPLICA_DISCOVERY_INITIALIZATION_DELAY}}"`
-   **policiesConfigs.replicaDiscovery.statusDebounceDelay**: Debounce delay in milliseconds after receiving a status update from other replicas. This delay helps manage multiple replicas sharing status simultaneously and avoid excessive state reloads.
    -   Example: `"{{REPLICA_DISCOVERY_STATUS_DEBOUNCE_DELAY}}"`
-   **policiesConfigs.replicaDiscovery.closeDebounceDelay**: Delay in milliseconds before marking a replica as closed if it becomes unavailable. This delay ensures that replica shutdowns do not lead to premature closure and will reload the scheduler as few times as possible.
    -   Example: `"{{REPLICA_DISCOVERY_CLOSE_DEBOUNCE_DELAY}}"`
-   **policiesConfigs.replicaDiscovery.discoveryInterval**: Interval in milliseconds for conducting ongoing discovery to check the status of replicas.
    -   Example: `"{{REPLICA_DISCOVERY_INTERVAL}}"`

### API Limits Settings

-   **apiLimits.maxDateDiff**: Maximum difference in milliseconds between `rangeDateStart` and `rangeDateEnd` in timeseries data list.
    -   Example: `"{{API_LIMITS_MAX_DATE_DIFF}}"`
-   **apiLimits.maxItemsRetrieved**: The maximum number of items that could be retrieved from list data endpoints.
    -   Example: `"{{API_LIMITS_MAX_ITEMS_RETRIEVED}}"`
-   **apiLimits.aggregations.maxDateDiff**: Maximum time difference in milliseconds between `rangeDateStart` and `rangeDateEnd` for synchronous aggregation queries.
    -   Example: `"{{API_LIMITS_AGGREGATIONS_MAX_DATE_DIFF}}"`
-   **apiLimits.aggregations.stepSize**: The step size in milliseconds for breaking down the data during synchronous aggregation.
    -   Example: `"{{API_LIMITS_AGGREGATIONS_STEP_SIZE}}"`
-   **apiLimits.aggregations.asyncMaxDateDiff**: Maximum time difference in milliseconds between `rangeDateStart` and `rangeDateEnd` for asynchronous aggregation queries.
    -   Example: `"{{API_LIMITS_AGGREGATIONS_ASYNC_MAX_DATE_DIFF}}"`
-   **apiLimits.aggregations.asyncStepSize**: The step size in milliseconds for breaking down the data during asynchronous aggregation.
    -   Example: `"{{API_LIMITS_AGGREGATIONS_ASYNC_STEP_SIZE}}"`

---

Please, note that the placeholders (like `{{PORT}}`) should be replaced with actual values during runtime or configuration setup.

---

🟣 [Back to main doc file](../../README.md)
