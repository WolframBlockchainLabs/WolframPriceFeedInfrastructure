import { Op }   from 'sequelize';
import Ticker   from '../../domain-model/Ticker.js';
import Market   from '../../domain-model/Market.js';
import Exchange from '../../domain-model/Exchange.js';
import Base     from '../Base.js';

export default class TickersList extends Base {
    static validationRules = {
        symbol         : [ 'required', 'string', 'symbol', 'not_empty' ],
        exchangeNames  : [ 'required', 'string', 'not_empty', 'arrayParams' ],
        limit          : [ 'not_empty', 'positive_integer', { default: 5 } ],
        offset         : [ 'not_empty', 'integer', { 'min_number': 0 }, { default: 0 } ],
        rangeDateStart : [ 'not_empty', 'iso_timestamp', 'date_compare' ],
        rangeDateEnd   : [ 'not_empty', 'iso_timestamp', 'date_compare' ]

    }

    async execute({ symbol, exchangeNames, limit, offset, rangeDateStart, rangeDateEnd }) {
        const where = rangeDateStart && rangeDateEnd ?
            { createdAt: { [Op.between]: [ rangeDateStart, rangeDateEnd ] } } : null;

        const tickersList = await Ticker.findAll({
            include : [
                {
                    model   : Market,
                    as      : 'Market',
                    include : [
                        {
                            model    : Exchange,
                            as       : 'Exchange',
                            where    : { name: { [Op.in]: exchangeNames } },
                            required : false
                        }
                    ],
                    where    : { symbol },
                    required : false
                }
            ],
            where,
            order : [ [ 'createdAt', 'DESC' ] ],
            limit,
            offset
        });

        return tickersList;
    }
}
