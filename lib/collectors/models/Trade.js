import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from '../BaseCollector.js';

class TradeCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.trade;

    async fetchData() {
        const { exchange, exchangeAPI, symbol, intervalStart } = this;

        try {
            return await exchangeAPI.fetchTrades(symbol, intervalStart);
        } catch (error) {
            this.logger.error({
                message: `Could not get Trade for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData(fetchedData) {
        const { exchange, symbol, intervalEnd } = this;

        const tradesInfo = fetchedData
            .filter((trade) => trade.timestamp <= intervalEnd)
            .map((element) => {
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
