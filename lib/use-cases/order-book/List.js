import OrderBook from '../../domain-model/entities/market-records/OrderBook.js';
import Base from '../BaseUseCase.js';
import dumpOrderBook from '../utils/dumps/dumpOrderBook.js';

class OrderBooksList extends Base {
    static validationRules = {
        symbol: ['required', 'string', 'symbol'],
        exchangeNames: ['required', 'string', 'array_params'],
        limit: ['not_empty', 'positive_integer', { default: 5 }],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
        rangeDateStart: ['not_empty', 'iso_timestamp', 'date_compare'],
        rangeDateEnd: ['not_empty', 'iso_timestamp', 'date_compare'],
    };

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
