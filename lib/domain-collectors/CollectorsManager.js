import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';
import BackoffPolicy from './infrastructure/amqp-policies/BackoffPolicy.js';
import StatusUpdatePolicy from './infrastructure/amqp-policies/StatusUpdatePolicy.js';
import StableRealtimeScheduler from './infrastructure/schedulers/StableRealtimeScheduler.js';

class CollectorsManager {
    constructor({
        models,
        exchange,
        symbol,
        pair,
        rabbitGroupName,
        exchangeAPI,
        amqpClient,
        logger,
        schedulerOptions,
    }) {
        this.models = models;
        this.collectors = [];

        this.exchange = exchange;
        this.symbol = symbol;
        this.pair = pair;

        this.exchangeAPI = exchangeAPI;
        this.amqpClient = amqpClient;
        this.logger = logger;

        this.initScheduler(schedulerOptions);
        this.initBackoffPolicy(rabbitGroupName);
        this.initStatusUpdatePolicy(rabbitGroupName);
    }

    async start() {
        await this.loadMarketContext();
        await this.connectCollectors();

        await this.startBackoffPolicy();
        await this.startStatusUpdatePolicy();
        await this.startScheduler();
    }

    async startCollector(collector) {
        try {
            await collector.start(this.collectorsScheduler.getIntervalBounds());
        } catch (error) {
            this.logger.error({
                message: `${collector.getName()} failed`,
                context: this.getLogContext(),
                error,
            });

            if (error instanceof RateLimitExceededException) {
                this.logger.info({
                    message: `Initiating backoff policy for ${collector.getName()}`,
                    context: this.getLogContext(),
                    error,
                });

                await this.backoffPolicy.broadcastRateLimitChange(
                    this.collectorsScheduler.getMultiplierBackoff(),
                );
            }
        }
    }

    async loadMarketContext() {
        const storedExchange = await Exchange.findOneOrFail({
            where: { externalExchangeId: this.exchange },
        });

        const storedMarket = await Market.findOneOrFail({
            where: { exchangeId: storedExchange.id, symbol: this.symbol },
        });

        this.marketId = storedMarket.id;
    }

    async connectCollectors() {
        this.initCollectors();

        const connectionPromises = this.collectors.map((collector) => {
            return collector.initAMQPConnection();
        });

        return Promise.all(connectionPromises);
    }

    /* istanbul ignore next */
    async startScheduler() {
        return this.collectorsScheduler.start({
            operations: this.collectors.map((collector) => {
                return () => {
                    this.startCollector(collector);
                };
            }),
        });
    }

    async startBackoffPolicy() {
        return this.backoffPolicy.start(
            this.collectorsScheduler.autoUpdateRateLimitMultiplier.bind(
                this.collectorsScheduler,
            ),
        );
    }

    async startStatusUpdatePolicy() {
        return this.statusUpdatePolicy.start({
            updateHandler:
                this.collectorsScheduler.updateRateLimitMultiplier.bind(
                    this.collectorsScheduler,
                ),
            getStatusHandler: this.collectorsScheduler.getMultiplier.bind(
                this.collectorsScheduler,
            ),
        });
    }

    initCollectors() {
        this.collectors = this.models.map((CollectorModel) => {
            return new CollectorModel({
                logger: this.logger,
                exchange: this.exchange,
                symbol: this.symbol,
                pair: this.pair,
                marketId: this.marketId,
                exchangeAPI: this.exchangeAPI,
                amqpClient: this.amqpClient,
            });
        });
    }

    initScheduler(schedulerOptions) {
        this.collectorsScheduler = new StableRealtimeScheduler({
            ...schedulerOptions,
            logger: this.logger,
            taskName: `${this.exchange}::${this.symbol}`,
        });
    }

    initBackoffPolicy(rabbitGroupName) {
        this.backoffPolicy = new BackoffPolicy({
            amqpClient: this.amqpClient,
            rabbitGroupName,
        });
    }

    initStatusUpdatePolicy(rabbitGroupName) {
        this.statusUpdatePolicy = new StatusUpdatePolicy({
            amqpClient: this.amqpClient,
            rabbitGroupName,
        });
    }

    getLogContext() {
        return {
            exchange: this.exchange,
            symbol: this.symbol,
            ...this.collectorsScheduler.getIntervalBounds(),
        };
    }
}

export default CollectorsManager;
