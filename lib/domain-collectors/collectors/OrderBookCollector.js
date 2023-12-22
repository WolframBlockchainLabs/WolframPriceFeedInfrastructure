import { DATABASE_WRITER_QUEUES } from '#constants/rabbimqQueues.js';
import BaseCollector from './BaseCollector.js';

class OrderBookCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.orderBook;

    async fetchData() {
        const { exchangeAPI, symbol } = this;

        return exchangeAPI.fetchOrderBook(symbol);
    }

    async saveData({ bids, asks }, collectorMeta) {
        const { exchange, symbol } = this;

        this.publish(
            {
                bids,
                asks,
            },
            collectorMeta,
        );

        this.logger.debug({
            message: `OrderBook for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
            context: this.getLogContext(collectorMeta),
        });
    }
}

export default OrderBookCollector;
