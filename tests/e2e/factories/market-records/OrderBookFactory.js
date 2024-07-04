import { faker } from '@faker-js/faker';
import dumpOrderBook from '#use-cases/utils/dumps/dumpOrderBook.js';
import OrderBook from '#domain-model/entities/market-records/OrderBook.js';
import BaseMarketRecordFactory from './BaseMarketRecordFactory.js';

class OrderBookFactory extends BaseMarketRecordFactory {
    static DEFAULT_RECORDS_COUNT = 3;

    async create({
        markets = [],
        recordsCount = OrderBookFactory.DEFAULT_RECORDS_COUNT,
    }) {
        const orderBookPromises = markets.flatMap(({ id: marketId }) => {
            return Array.from({ length: recordsCount }, (_, index) => {
                return OrderBook.create({
                    marketId,
                    intervalStart: this.shiftDateFor(
                        OrderBookFactory.INITIAL_INTERVAL_START,
                        index,
                    ),
                    intervalEnd: this.shiftDateFor(
                        OrderBookFactory.INITIAL_INTERVAL_END,
                        index,
                    ),
                    ...this.generateOrderBookData(),
                });
            });
        });

        const orderBooks = await Promise.all(orderBookPromises);

        return orderBooks.map((orderBook) => {
            return dumpOrderBook(orderBook);
        });
    }

    async findOrderBook(recordId) {
        const orderBook = await OrderBook.scope([
            {
                method: ['searchById', recordId],
            },
        ]).findOne();

        return dumpOrderBook(orderBook);
    }

    generateOrderBookData() {
        return {
            bids: [[faker.number.float()], [faker.number.float()]],
            asks: [[faker.number.float()], [faker.number.float()]],
        };
    }
}

export default OrderBookFactory;
