import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from './BaseCollector.js';

class TradeCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.trade;

    async fetchData({ intervalStart }) {
        const { exchangeAPI, symbol } = this;

        return exchangeAPI.fetchTrades(symbol, intervalStart);
    }

    async saveData(fetchedData, collectorMeta) {
        const { exchange, symbol } = this;

        const tradesInfo = fetchedData
            .filter((trade) => trade.timestamp <= collectorMeta.intervalEnd)
            .map((element) => {
                const { side, price, amount, timestamp } = element;

                const sideNum = +(side === 'sell');

                return [sideNum, price, amount, timestamp];
            });

        this.publish(
            {
                tradesInfo,
            },
            collectorMeta,
        );

        this.logger.debug({
            message: `Trade for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
            context: this.getLogContext(collectorMeta),
        });
    }
}

export default TradeCollector;
