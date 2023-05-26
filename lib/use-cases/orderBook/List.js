import OrderBook from '../../domain-model/OrderBook.js';
import Market    from '../../domain-model/Market.js';
import Base      from '../Base.js';

export default class OrderBooksList extends Base {
    static validationRules = {
        symbol     : [ 'required', 'string' ],
        exchangeId : [ 'required', 'string' ],
        limit      : [ 'not_empty', 'positive_integer', { default: 20 } ],
        offset     : [ 'not_empty', 'integer', { 'min_number': 0 }, { default: 0 } ]
    }

    async execute({ symbol, exchangeId, limit, offset }) {
        const { id: marketId } = await Market.findOne({            where : {
            symbol, exchangeId
        } });

        const { count, rows } = await OrderBook.findAll({
            where : {
                marketId
            },
            order : [ [ 'createdAt', 'DESC' ] ],
            limit,
            offset
        });

        return {
            count,
            rows
        };
    }
}
