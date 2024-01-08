import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

class CollectorsManager {
    constructor({
        models,
        exchange,
        symbol,
        pair,
        exchangeAPI,
        amqpClient,
        logger,
        collectorsScheduler,
        marketsManager,
    }) {
        this.models = models;
        this.collectors = [];

        this.exchange = exchange;
        this.symbol = symbol;
        this.pair = pair;

        this.exchangeAPI = exchangeAPI;
        this.amqpClient = amqpClient;
        this.collectorsScheduler = collectorsScheduler;
        this.marketsManager = marketsManager;
        this.logger = logger;
    }

    async start() {
        await this.loadMarketContext();
        await this.connectCollectors();

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

                await this.marketsManager.broadcastRateLimitChange(
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

    async startScheduler() {
        return this.collectorsScheduler.start({
            operations: this.collectors.map((collector) => {
                return () => {
                    this.startCollector(collector);
                };
            }),
            taskName: this.getCollectorManagerTaskName(),
        });
    }

    async updateRateLimit(newMultiplier) {
        return this.collectorsScheduler.updateRateLimitMultiplier(
            newMultiplier,
        );
    }

    async getRateLimitMultiplier() {
        return this.collectorsScheduler.getMultiplier();
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

    getLogContext() {
        return {
            exchange: this.exchange,
            symbol: this.symbol,
            ...this.collectorsScheduler.getIntervalBounds(),
        };
    }

    getCollectorManagerTaskName() {
        return `${this.exchange}::${this.symbol}`;
    }
}

export default CollectorsManager;
