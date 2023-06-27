import amqp from 'amqp-connection-manager';
import Exchange from '../domain-model/entities/Exchange.js';
import Market from '../domain-model/entities/Market.js';

class CollectorsManager {
    constructor({ models, logger, exchange, symbol, exchangeAPI, config }) {
        this.models = models;
        this.collectors = [];

        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.exchangeAPI = exchangeAPI;
        this.config = config;

        this.amqpConnection = null;
        this.channelWrapper = null;
    }

    async start() {
        await this.init();

        try {
            await Promise.all(
                this.collectors.map((collector) => collector.start()),
            );
        } catch (error) {
            this.logger.error({
                message: `'${this.exchange} & ${this.symbol}' Collector failed`,
                error,
            });
        }
    }

    async init() {
        await this.loadContext();

        this.buildCollectors();

        await this.initAMQPConnection();
    }

    async loadContext() {
        const storedExchange = await Exchange.findOne({
            where: { externalExchangeId: this.exchange },
        });

        const storedMarket = await Market.findOne({
            where: { exchangeId: storedExchange.id, symbol: this.symbol },
        });

        this.marketId = storedMarket.id;
    }

    async initAMQPConnection() {
        this.amqpConnection = amqp.connect(this.config.rabbitmq.urls);

        this.channelWrapper = await this.amqpConnection.createChannel({
            setup: this.initPublishers.bind(this),
        });
    }

    buildCollectors() {
        for (const CollectorModel of this.models) {
            const collector = new CollectorModel({
                logger: this.logger,
                exchange: this.exchange,
                symbol: this.symbol,
                marketId: this.marketId,
                exchangeAPI: this.exchangeAPI,
            });

            this.collectors.push(collector);
        }
    }

    initPublishers(channel) {
        const initPublisherPromises = this.collectors.map((collector) =>
            collector.initAMQPConnection(channel),
        );

        return Promise.all(initPublisherPromises);
    }
}

export default CollectorsManager;
