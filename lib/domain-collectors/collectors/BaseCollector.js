import crypto from 'crypto';

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
    }

    async start({ intervalStart, intervalEnd }) {
        const { exchange, symbol } = this;

        const collectorMeta = {
            intervalStart,
            intervalEnd,
            collectorTraceId: crypto.randomBytes(4).toString('hex'),
        };

        this.logger.debug({
            message: `Collector for '${exchange} & ${symbol} & ${this.QUEUE_NAME}' is running`,
            context: this.getLogContext(collectorMeta),
        });

        try {
            const data = await this.fetchData(collectorMeta);

            await this.saveData(data, collectorMeta);
        } catch (error) {
            this.logger.error({
                message: `'${exchange} & ${symbol}' Collector has finished with an error`,
                context: this.getLogContext(collectorMeta),
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

    publish(payload, { intervalStart, intervalEnd, collectorTraceId }) {
        const { marketId, exchange, symbol } = this;

        return this.amqpClient.publish(this.QUEUE_NAME, {
            exchange,
            symbol,
            payload: {
                ...payload,
                intervalStart,
                intervalEnd,
                marketId,
            },
            collectorTraceId,
        });
    }

    getLogContext({ intervalStart, intervalEnd, collectorTraceId }) {
        return {
            intervalStart: new Date(intervalStart).toISOString(),
            intervalEnd: new Date(intervalEnd).toISOString(),
            symbol: this.symbol,
            exchange: this.exchange,
            marketId: this.marketId,
            collectorTraceId,
        };
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
