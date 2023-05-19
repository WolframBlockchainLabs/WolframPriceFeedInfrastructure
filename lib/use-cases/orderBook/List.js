import OrderBook from '../../domain-model/OrderBook.js';
import Base      from '../Base.js';

export default class OrderBooksList extends Base {
    static validationRules = {
        marketId : [ 'required', 'string' ],
        limit    : [ 'not_empty', 'positive_integer', { default: 20 } ],
        offset   : [ 'not_empty', 'integer', { 'min_number': 0 }, { default: 0 } ]
    }

    async execute({ marketId, limit, offset }) {
        const { count, rows } = await OrderBook.findAndCountAll({
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
