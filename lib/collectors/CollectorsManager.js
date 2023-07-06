import Exchange from '../domain-model/entities/Exchange.js';
import Market from '../domain-model/entities/Market.js';
import cron from 'node-cron';
import cronParser from 'cron-parser';
import closestDivisor from '../utils/closestDivisor.js';
import { MILLISECONDS_IN_A_MINUTE } from '../constants/timeframes.js';

class CollectorsManager {
    constructor({
        models,
        logger,
        exchange,
        symbol,
        exchangeAPI,
        amqpClient,
        rateLimit,
        rateLimitMargin,
        queuePosition,
        queueSize,
        replicaSize,
        instancePosition,
    }) {
        this.models = models;
        this.collectors = [];

        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.exchangeAPI = exchangeAPI;
        this.amqpClient = amqpClient;

        this.rateLimit = rateLimit + rateLimitMargin;
        this.rateLimitMargin = rateLimitMargin;
        this.queuePosition = queuePosition;
        this.queueSize = queueSize;
        this.replicaSize = replicaSize;
        this.instancePosition = instancePosition;

        this.interval = null;
        this.intraIntervalDistance = null;
        this.schedule = null;
        this.intervalStart = null;
        this.intervalEnd = null;
    }

    async start() {
        await this.loadMarketContext();
        await this.initCollectors();

        this.setupInterval();
        this.setupSchedule();
    }

    async runCollectors() {
        this.intervalStart = this.schedule.prev().toDate();
        this.intervalEnd = this.schedule.next().toDate();
        this.schedule.next();

        for (let i = 0; i < this.collectors.length; i++) {
            const desyncTimeout =
                (this.rateLimit + this.intraIntervalDistance) * i +
                (this.rateLimit + this.intraIntervalDistance) *
                    this.instancePosition *
                    this.collectors.length;
            const collector = this.collectors[i];

            collector.setInterval(this.intervalStart, this.intervalEnd);

            setTimeout(async () => {
                try {
                    await collector.start();
                } catch (error) {
                    this.logger.error({
                        message: `'${this.exchange} & ${this.symbol}' Collector failed`,
                        error,
                    });
                }
            }, desyncTimeout);
        }
    }

    setupInterval() {
        const intervalInMilliseconds =
            this.rateLimit *
            this.queueSize *
            this.collectors.length *
            this.replicaSize;
        const intervalInMinutes = Math.ceil(
            intervalInMilliseconds / MILLISECONDS_IN_A_MINUTE,
        );

        const normalizedInterval = closestDivisor(intervalInMinutes, 60);

        this.interval = `*/${normalizedInterval} * * * *`;
        this.intraIntervalDistance =
            (normalizedInterval * MILLISECONDS_IN_A_MINUTE -
                intervalInMilliseconds) /
            (this.queueSize * this.collectors.length * this.replicaSize);
    }

    setupSchedule() {
        this.schedule = cronParser.parseExpression(this.interval, {
            preset: 'default',
        });
        this.schedule.next();
        this.schedule.next();

        cron.schedule(this.interval, () => {
            const desyncTimeout =
                (this.rateLimit + this.intraIntervalDistance) *
                this.queuePosition *
                this.collectors.length *
                this.replicaSize;

            setTimeout(this.runCollectors.bind(this), desyncTimeout);
        });
    }

    async loadMarketContext() {
        const storedExchange = await Exchange.findOne({
            where: { externalExchangeId: this.exchange },
        });

        const storedMarket = await Market.findOne({
            where: { exchangeId: storedExchange.id, symbol: this.symbol },
        });

        if (!storedMarket) {
            throw new Error(
                `Could not find market for '${this.exchange} & ${this.symbol}'`,
            );
        }

        this.marketId = storedMarket.id;
    }

    async initCollectors() {
        for (const CollectorModel of this.models) {
            const collector = new CollectorModel({
                logger: this.logger,
                exchange: this.exchange,
                symbol: this.symbol,
                marketId: this.marketId,
                exchangeAPI: this.exchangeAPI,
                amqpClient: this.amqpClient,
            });

            await collector.initAMQPConnection();
            this.collectors.push(collector);
        }
    }
}

export default CollectorsManager;
