// eslint-disable-next-line import/no-unresolved
import { RateLimitExceeded } from 'ccxt';
import Exchange from '../domain-model/entities/Exchange.js';
import Market from '../domain-model/entities/Market.js';
import sleep from '../utils/sleep.js';
import BackoffPolicy from './infrastructure/amqp-policies/BackoffPolicy.js';
import StatusUpdatePolicy from './infrastructure/amqp-policies/StatusUpdatePolicy.js';
import RealtimeScheduler from './infrastructure/schedulers/RealtimeScheduler.js';

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

    async runCollectors() {
        try {
            const collectorPromises = this.collectors.map((collector, index) =>
                this.startCollectorWithDelay(collector, index),
            );

            await Promise.all(collectorPromises);
        } catch (error) {
            this.logger.error({
                message: 'Error while running collectors',
                context: this.getLogContext(),
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
                context: this.getLogContext(),
                error,
            });

            if (error instanceof RateLimitExceeded) {
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

    async startScheduler() {
        return this.collectorsScheduler.start({
            handler: this.runCollectors.bind(this),
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
        this.collectorsScheduler = new RealtimeScheduler({
            ...schedulerOptions,
            logger: this.logger,
            operationsAmount: this.models.length,
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
