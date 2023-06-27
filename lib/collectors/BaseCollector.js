class BaseCollector {
    constructor({ logger, exchange, symbol, marketId, exchangeAPI }) {
        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.marketId = marketId;
        this.exchangeAPI = exchangeAPI;

        this.channel = null;
        this.queueName = null;
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

    async initAMQPConnection(channel) {
        this.channel = channel;

        await channel.assertQueue(this.queueName, {
            durable: true,
        });
    }

    async publish(msg) {
        const messageBuffer = Buffer.from(JSON.stringify(msg));

        return this.channel.sendToQueue(this.queueName, messageBuffer);
    }

    /* c8 ignore next */
    async fetchData() {}

    /* c8 ignore next */
    async saveData() {}
}

export default BaseCollector;
