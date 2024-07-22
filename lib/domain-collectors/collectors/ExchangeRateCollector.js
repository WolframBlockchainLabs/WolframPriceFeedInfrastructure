import { DATABASE_WRITER_QUEUES } from '#constants/amqp/rabbit-queues.js';
import BaseCollector from './BaseCollector.js';

class ExchangeRateCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.exchangeRate;

    async fetchData() {
        const { exchangeAPI, pair } = this;

        return exchangeAPI.getExchangeRate(pair);
    }

    async saveData({ exchangeRate, poolASize, poolBSize }, collectorMeta) {
        const { exchange, symbol } = this;

        await this.publish(
            {
                exchangeRate,
                poolASize,
                poolBSize,
            },
            collectorMeta,
        );

        this.logger.debug({
            message: `ExchangeRate for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
            context: this.getLogContext(collectorMeta),
        });
    }
}

export default ExchangeRateCollector;
