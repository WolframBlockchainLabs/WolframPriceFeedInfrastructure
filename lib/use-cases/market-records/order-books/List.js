import OrderBook from '#domain-model/entities/market-records/OrderBook.js';
import dumpOrderBook from '../../utils/dumps/dumpOrderBook.js';
import BaseMarketRecordUseCase from '../BaseMarketRecordUseCase.js';

class OrderBooksList extends BaseMarketRecordUseCase {
    async execute(queryParams) {
        const orderBooks = await OrderBook.scope([
            {
                method: ['search', queryParams],
            },
        ]).findAll();

        return {
            data: orderBooks.map(dumpOrderBook),
            meta: {
                fetchCount: orderBooks.length,
            },
        };
    }
}

export default OrderBooksList;
