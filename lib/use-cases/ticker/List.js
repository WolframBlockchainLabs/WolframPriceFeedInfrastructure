import { Op }   from 'sequelize';
import Ticker   from '../../domain-model/Ticker.js';
import Market   from '../../domain-model/Market.js';
import Exchange from '../../domain-model/Exchange.js';
import Base     from '../Base.js';

export default class OrderBooksList extends Base {
    static validationRules = {
        symbol         : [ 'required', 'string', 'symbol' ],
        exchangeName   : [ 'required', 'string' ],
        limit          : [ 'not_empty', 'positive_integer', { default: 20 } ],
        offset         : [ 'not_empty', 'integer', { 'min_number': 0 }, { default: 0 } ],
        rangeDateStart : [ 'nullable' ],
        rangeDateEnd   : [ 'nullable' ]
    }

    async execute({ symbol, exchangeName, limit, offset, rangeDateStart, rangeDateEnd }) {
        const { id: exchangeId } = await Exchange.findOne({ where: { name: exchangeName } });

        const { id: marketId } = await Market.findOne({ where: { symbol, exchangeId } });

        const where =  {};

        if (rangeDateStart && rangeDateEnd) {
            where.createdAt = {
                [Op.between] : [ rangeDateStart, rangeDateEnd ]
            };
            where.marketId = marketId;
        } else {
            where.marketId = marketId;
        }

        const orderBook = await Ticker.findAll({
            where,
            order : [ [ 'createdAt', 'DESC' ] ],
            limit,
            offset
        });

        return orderBook;
    }
}
