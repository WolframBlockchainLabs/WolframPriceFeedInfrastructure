import Exchange from '../domain-model/entities/Exchange.js';
import Market from '../domain-model/entities/Market.js';
import cron from 'node-cron';
import cronParser from 'cron-parser';

class CollectorsManager {
    constructor({
        models,
        logger,
        exchange,
        symbol,
        exchangeAPI,
        amqpClient,
        interval,
        desync,
    }) {
        this.models = models;
        this.collectors = [];

        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.exchangeAPI = exchangeAPI;
        this.amqpClient = amqpClient;
        this.interval = interval;
        this.desync = desync;

        this.schedule = null;
        this.intervalStart = null;
        this.intervalEnd = null;
    }

    async start() {
        await this.loadMarketContext();
        await this.initCollectors();

        this.schedule = cronParser.parseExpression(this.interval, {
            preset: 'default',
        });
        this.schedule.next();

        cron.schedule(this.interval, () => {
            setTimeout(this.runCollectors.bind(this), this.desync);
        });
    }

    async runCollectors() {
        this.intervalStart = this.schedule.prev().toDate();
        this.intervalEnd = this.schedule.next().toDate();
        this.schedule.next();

        try {
            await Promise.all(
                this.collectors.map(async (collector) => {
                    collector.setInterval(this.intervalStart, this.intervalEnd);

                    await collector.start();
                }),
            );
        } catch (error) {
            this.logger.error({
                message: `'${this.exchange} & ${this.symbol}' Collector failed`,
                error,
            });
        }
    }

    async loadMarketContext() {
        const storedExchange = await Exchange.findOne({
            where: { externalExchangeId: this.exchange },
        });

        const storedMarket = await Market.findOne({
            where: { exchangeId: storedExchange.id, symbol: this.symbol },
        });

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
