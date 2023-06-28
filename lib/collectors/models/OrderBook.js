import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from '../BaseCollector.js';

class OrderBookCollector extends BaseCollector {
    queueName = DATABASE_WRITER_QUEUES.orderBook;

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

    async saveData({ bids, asks }, marketId) {
        const { exchange, symbol } = this;

        try {
            await this.publish({
                exchange,
                symbol,
                payload: {
                    marketId,
                    bids,
                    asks,
                },
            });

            this.logger.info(
                `OrderBook for '${exchange} & ${symbol}' have been sent to the [${this.queueName}] queue`,
            );
        } catch (error) {
            this.logger.error({
                message: `Could not send OrderBook for '${exchange} & ${symbol}' to the [${this.queueName}] queue`,
                error,
            });
        }
    }
}

export default OrderBookCollector;
