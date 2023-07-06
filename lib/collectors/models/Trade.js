import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from '../BaseCollector.js';

class TradeCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.trade;

    async fetchData() {
        const { exchange, exchangeAPI, symbol, intervalStart, intervalEnd } =
            this;

        const sinceTimestamp = Date.now() - (intervalEnd - intervalStart);

        try {
            return await exchangeAPI.fetchTrades(symbol, sinceTimestamp);
        } catch (error) {
            this.logger.error({
                message: `Could not get Trade for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData(fetchedData) {
        const { exchange, symbol } = this;

        const tradesInfo = fetchedData.map((element) => {
            const { side, price, amount, timestamp } = element;

            const sideNum = +(side === 'sell');

            return [sideNum, price, amount, timestamp];
        });

        this.publish({
            tradesInfo,
        });

        this.logger.info(
            `Trade for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
        );
    }
}

export default TradeCollector;
