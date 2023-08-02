import Exchange from '../domain-model/entities/Exchange.js';
import Market from '../domain-model/entities/Market.js';
import CollectorsScheduler from './CollectorsScheduler.js';

class CollectorsManager extends CollectorsScheduler {
    constructor({
        models,
        logger,
        exchange,
        symbol,
        exchangeAPI,
        amqpClient,
        ...schedulerOptions
    }) {
        super({ ...schedulerOptions, operationsAmount: models.length });

        this.models = models;
        this.collectors = [];

        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.exchangeAPI = exchangeAPI;
        this.amqpClient = amqpClient;
    }

    async start() {
        await this.loadMarketContext();
        await this.initCollectors();

        super.start();
    }

    async runCollectors() {
        super.runCollectors();

        for (let i = 0; i < this.collectors.length; i++) {
            const desyncTimeout = this.getOperationDesync(i);
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
