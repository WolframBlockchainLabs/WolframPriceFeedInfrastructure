import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from '../BaseCollector.js';

class OrderBookCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.orderBook;

    async fetchData() {
        const { exchange, exchangeAPI, symbol } = this;

        try {
            return await exchangeAPI.fetchOrderBook(symbol);
        } catch (error) {
            this.logger.error({
                message: `Could not get OrderBook for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData({ bids, asks }) {
        const { exchange, symbol } = this;

        this.publish({
            bids,
            asks,
        });

        this.logger.info(
            `OrderBook for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
        );
    }
}

export default OrderBookCollector;
