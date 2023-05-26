import { Op }    from 'sequelize';
import OrderBook from '../../domain-model/OrderBook.js';
import Market    from '../../domain-model/Market.js';
import Exchange  from '../../domain-model/Exchange.js';
import Base      from '../Base.js';

export default class OrderBooksList extends Base {
    static validationRules = {
        symbol         : [ 'required', 'string' ],
        exchangeName   : [ 'required', 'string' ],
        limit          : [ 'not_empty', 'positive_integer', { default: 20 } ],
        offset         : [ 'not_empty', 'integer', { 'min_number': 0 }, { default: 0 } ],
        rangeDateStart : [ 'not_empty', 'nullable', { 'iso_date': { format: 'datetime' } } ],
        rangeDateEnd   : [ 'not_empty', 'nullable', { 'iso_date': { format: 'datetime' } } ]
    }

    async execute({ symbol, exchangeName, limit, offset, rangeDateStart, rangeDateEnd }) {
        const normalizeSymbol = symbol.replace(/_/g, '/');

        const { id: exchangeId } = await Exchange.findOne({ where: { name: exchangeName } });

        const { id: marketId } = await Market.findOne({ where: { symbol: normalizeSymbol, exchangeId } });

        const where =  {};

        if (rangeDateStart && rangeDateEnd) {
            where.createdAt = {
                [Op.between] : [ rangeDateStart, rangeDateEnd ]
            };
        }

        const orderBook = await OrderBook.findAll({
            where : {
                marketId
            },
            order : [ [ 'createdAt', 'DESC' ] ],
            limit,
            offset
        });

        return orderBook;
    }
}
