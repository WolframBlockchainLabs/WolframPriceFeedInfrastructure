import Exchange from '../domain-model/entities/Exchange.js';
import Market from '../domain-model/entities/Market.js';
import sleep from '../utils/sleep.js';
import RealtimeScheduler from './infrastructure/RealtimeScheduler.js';

class CollectorsManager {
    constructor({
        models,
        exchange,
        symbol,
        pair,
        exchangeAPI,
        amqpClient,
        logger,
        ...schedulerOptions
    }) {
        this.models = models;
        this.collectors = [];

        this.exchange = exchange;
        this.symbol = symbol;
        this.pair = pair;

        this.exchangeAPI = exchangeAPI;
        this.amqpClient = amqpClient;
        this.logger = logger;

        this.initCollectors();
        this.initScheduler(schedulerOptions);
    }

    async start() {
        await this.loadMarketContext();
        await this.initCollectors();

        await this.startScheduler();
    }

    async runCollectors() {
        try {
            const collectorPromises = this.collectors.map((collector, index) =>
                this.startCollectorWithDelay(collector, index),
            );

            await Promise.all(collectorPromises);
        } catch (error) {
            this.logger.error({
                message: 'Error while running collectors',
                ...this.getLogContext(),
                error,
            });
        }
    }

    async startCollectorWithDelay(collector, index) {
        const timeout = this.collectorsScheduler.getOperationDesync(index);
        collector.setInterval(this.collectorsScheduler.getIntervalBounds());

        await sleep(timeout);

        try {
            await collector.start();
        } catch (error) {
            this.logger.error({
                message: `${collector.getName()} failed`,
                ...this.getLogContext(),
                error,
            });
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
        const connectionPromises = this.collectors.map((collector) => {
            return collector.initAMQPConnection();
        });

        return Promise.all(connectionPromises);
    }

    async startScheduler(rateLimitMultiplier) {
        return this.collectorsScheduler.start({
            handler: this.runCollectors.bind(this),
            rateLimitMultiplier,
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
        this.collectorsScheduler = new RealtimeScheduler({
            ...schedulerOptions,
            logger: this.logger,
            operationsAmount: this.models.length,
            taskName: `${this.exchange}::${this.symbol}`,
        });
    }

    getLogContext() {
        return {
            intervalStart: this.intervalStart,
            intervalEnd: this.intervalEnd,
            exchange: this.exchange,
            symbol: this.symbol,
        };
    }
}

export default CollectorsManager;
