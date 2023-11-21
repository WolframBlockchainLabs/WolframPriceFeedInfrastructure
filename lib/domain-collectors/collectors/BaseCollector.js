class BaseCollector {
    constructor({
        logger,
        exchange,
        symbol,
        pair,
        marketId,
        exchangeAPI,
        amqpClient,
    }) {
        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.pair = pair;
        this.marketId = marketId;
        this.exchangeAPI = exchangeAPI;
        this.amqpClient = amqpClient;

        this.QUEUE_NAME = 'default';

        this.intervalStart = null;
        this.intervalEnd = null;
    }

    async start() {
        const { exchange, symbol } = this;

        this.logger.debug(
            `Collector for '${exchange} & ${symbol} & ${this.QUEUE_NAME}' is running`,
        );

        try {
            const data = await this.fetchData();

            await this.saveData(data);
        } catch (error) {
            this.logger.error({
                message: `'${exchange} & ${symbol}' Collector has finished with an error`,
                error,
            });

            throw error;
        }
    }

    async initAMQPConnection() {
        this.amqpClient.getChannel().addSetup((channel) => {
            return channel.assertQueue(this.QUEUE_NAME, {
                durable: true,
            });
        });
    }

    setInterval({ intervalStart, intervalEnd }) {
        this.intervalStart = intervalStart;
        this.intervalEnd = intervalEnd;
    }

    publish(payload) {
        const { intervalStart, intervalEnd, marketId, exchange, symbol } = this;

        return this.amqpClient.publish(this.QUEUE_NAME, {
            exchange,
            symbol,
            payload: {
                ...payload,
                intervalStart,
                intervalEnd,
                marketId,
            },
        });
    }

    /* istanbul ignore next */
    getName() {
        return this.constructor.name;
    }

    /* istanbul ignore next */
    fetchData() {}

    /* istanbul ignore next */
    saveData() {}
}

export default BaseCollector;