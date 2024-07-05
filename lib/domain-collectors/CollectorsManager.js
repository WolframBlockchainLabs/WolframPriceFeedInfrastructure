import { MARKET_EVENTS_DICT } from '#constants/market-events.js';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

class CollectorsManager {
    constructor({
        exchangeAPI,
        amqpClient,
        logger,
        collectorsScheduler,
        marketEventManager,
        marketId,
        models,
        Repositories,
    }) {
        this.exchangeAPI = exchangeAPI;
        this.amqpClient = amqpClient;
        this.collectorsScheduler = collectorsScheduler;
        this.marketEventManager = marketEventManager;
        this.logger = logger;

        this.marketId = marketId;
        this.models = models;
        this.Repositories = Repositories;
        this.MarketRepository = Repositories.MarketRepository;
        this.MarketLogRepository = Repositories.MarketLogRepository;

        this.collectors = [];
        this.market = {};
    }

    async start(dynamicSchedulerConfig) {
        try {
            await this.loadMarketContext();
            await this.connectCollectors();

            await this.startScheduler(dynamicSchedulerConfig);

            this.logger.debug({
                message: `${this.constructor.name} has been started`,
                context: this.getLogContext(),
            });
        } catch (error) {
            this.logger.error({
                message: `${this.constructor.name} has failed to start`,
                context: this.getLogContext(),
                error,
            });
        }
    }

    async stop() {
        try {
            await this.collectorsScheduler.stop();

            this.logger.debug({
                message: `${this.constructor.name} has been stopped`,
                context: this.getLogContext(),
            });
        } catch (error) {
            this.logger.error({
                message: `${this.constructor.name} has failed to stop`,
                context: this.getLogContext(),
                error,
            });
        }
    }

    async reload() {
        try {
            await this.stop();
            await this.start();

            this.logger.debug({
                message: `${this.constructor.name} has been reloaded`,
                context: this.getLogContext(),
            });
        } catch (error) {
            this.logger.error({
                message: `${this.constructor.name} has failed to reload`,
                context: this.getLogContext(),
                error,
            });
        }
    }

    async reloadActive(dynamicConfig) {
        try {
            await this.collectorsScheduler.reload(dynamicConfig);

            this.logger.debug({
                message: `${this.constructor.name}'s scheduler has been reloaded`,
                context: this.getLogContext(),
            });
        } catch (error) {
            this.logger.error({
                message: `${this.constructor.name}'s scheduler has failed to reload`,
                context: this.getLogContext(),
                error,
            });
        }
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

                this.marketEventManager.emit(
                    MARKET_EVENTS_DICT.RATE_LIMIT_EXCEEDED,
                    this.collectorsScheduler.getMultiplierBackoff(),
                );
            }
        }
    }

    async loadMarketContext() {
        this.market = await this.MarketRepository.getMarketContext(
            this.marketId,
        );
    }

    async connectCollectors() {
        this.initCollectors();

        const connectionPromises = this.collectors.map((collector) => {
            return collector.initAMQPConnection();
        });

        return Promise.all(connectionPromises);
    }

    async startScheduler(dynamicSchedulerConfig) {
        return this.collectorsScheduler.start({
            operations: this.collectors.map((collector) => {
                return () => this.startCollector(collector);
            }),
            taskName: this.getCollectorManagerTaskName(),
            ...dynamicSchedulerConfig,
        });
    }

    setDynamicConfig(dynamicSchedulerConfig) {
        return this.collectorsScheduler.setDynamicConfig(
            dynamicSchedulerConfig,
        );
    }

    initCollectors() {
        this.collectors = this.models.map((CollectorModel) => {
            return new CollectorModel({
                logger: this.logger,
                exchange: this.market.externalExchangeId,
                symbol: this.market.symbol,
                pair: this.market.pair,
                marketId: this.market.id,
                exchangeAPI: this.exchangeAPI,
                amqpClient: this.amqpClient,
            });
        });
    }

    getMarketId() {
        return this.marketId;
    }

    getLogContext() {
        return {
            exchange: this.market.externalExchangeId,
            symbol: this.market.symbol,
        };
    }

    getCollectorManagerTaskName() {
        return this.market.taskName;
    }
}

export default CollectorsManager;
