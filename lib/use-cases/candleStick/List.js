import { Op }      from 'sequelize';
import CandleStick from '../../domain-model/CandleStick.js';
import Market      from '../../domain-model/Market.js';
import Exchange    from '../../domain-model/Exchange.js';
import Base        from '../Base.js';

export default class CandleSticksList extends Base {
    static validationRules = {
        symbol         : [ 'required', 'string', 'symbol' ],
        exchangeName   : [ 'required', 'string' ],
        limit          : [ 'not_empty', 'positive_integer', { default: 5 } ],
        offset         : [ 'not_empty', 'integer', { 'min_number': 0 }, { default: 0 } ],
        rangeDateStart : [ 'not_empty', 'date_compare', 'iso_timestamp' ],
        rangeDateEnd   : [ 'not_empty', 'date_compare', 'iso_timestamp' ]
    }

    async execute({ symbol, exchangeName, limit, offset, rangeDateStart, rangeDateEnd }) {
        const { id: exchangeId } = await Exchange.findOneOrFail({ where: { name: exchangeName } });

        const { id: marketId } = await Market.findOneOrFail({ where: { symbol, exchangeId } });

        let where =  {};

        if (rangeDateStart && rangeDateEnd) {
            where = {
                createdAt : { [Op.between]: [ rangeDateStart, rangeDateEnd ] },
                marketId
            };
        } else {
            where = { marketId };
        }

        const orderBook = await CandleStick.findAll({
            where,
            order : [ [ 'createdAt', 'DESC' ] ],
            limit,
            offset
        });

        return orderBook;
    }
}
