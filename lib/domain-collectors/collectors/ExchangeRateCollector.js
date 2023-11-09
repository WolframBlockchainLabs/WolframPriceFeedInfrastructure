import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from './BaseCollector.js';

class ExchangeRateCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.exchangeRate;

    async fetchData() {
        const { exchangeAPI, pair } = this;

        return exchangeAPI.getExchangeRate(pair);
    }

    async saveData({ exchangeRate, poolASize, poolBSize }) {
        const { exchange, symbol } = this;

        this.publish({
            exchangeRate,
            poolASize,
            poolBSize,
        });

        this.logger.debug(
            `ExchangeRate for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
        );
    }
}

export default ExchangeRateCollector;
