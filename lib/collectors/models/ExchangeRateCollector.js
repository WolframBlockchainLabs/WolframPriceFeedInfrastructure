import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from './BaseCollector.js';

class ExchangeRateCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.exchangeRate;

    async fetchData() {
        const { exchange, exchangeAPI, symbol, pair } = this;

        try {
            return await exchangeAPI.getExchangeRate(pair);
        } catch (error) {
            this.logger.error({
                message: `Could not get ExchangeRate for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData({ exchangeRate, poolASize, poolBSize }) {
        const { exchange, symbol } = this;

        this.publish({
            exchangeRate,
            poolASize,
            poolBSize,
        });

        this.logger.info(
            `ExchangeRate for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
        );
    }
}

export default ExchangeRateCollector;
