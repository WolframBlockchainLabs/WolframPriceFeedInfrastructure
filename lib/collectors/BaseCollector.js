class BaseCollector {
    constructor({
        logger,
        exchange,
        symbol,
        marketId,
        exchangeAPI,
        amqpClient,
    }) {
        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.marketId = marketId;
        this.exchangeAPI = exchangeAPI;
        this.amqpClient = amqpClient;

        this.QUEUE_NAME = 'default';
    }

    async start() {
        const { exchange, symbol, marketId } = this;

        this.logger.info(`Collector for '${exchange} & ${symbol}' is running`);

        try {
            const data = await this.fetchData();
            if (!data) return;

            await this.saveData(data, marketId);
        } catch (error) {
            this.logger.error({
                message: `'${exchange} & ${symbol}' Collector has finished with an error`,
                error,
            });
        }
    }

    async initAMQPConnection() {
        this.amqpClient.getChannel().addSetup((channel) => {
            return channel.assertQueue(this.QUEUE_NAME, {
                durable: true,
            });
        });
    }

    async publish(message) {
        return this.amqpClient.publish(this.QUEUE_NAME, message);
    }

    /* c8 ignore next */
    async fetchData() {}

    /* c8 ignore next */
    async saveData() {}
}

export default BaseCollector;
