import { Op } from 'sequelize';
import Trade from '../../domain-model/entities/Trade.js';
import Market from '../../domain-model/entities/Market.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Base from '../BaseUseCase.js';
import { dumpTrade } from '../utils/dumps.js';

export default class TradesList extends Base {
    static validationRules = {
        symbol: ['required', 'string', 'symbol'],
        exchangeNames: ['required', 'string', 'array_params'],
        limit: ['not_empty', 'positive_integer', { default: 5 }],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
        rangeDateStart: ['not_empty', 'iso_timestamp', 'date_compare'],
        rangeDateEnd: ['not_empty', 'iso_timestamp', 'date_compare'],
    };

    async execute({
        symbol,
        exchangeNames,
        limit,
        offset,
        rangeDateStart,
        rangeDateEnd,
    }) {
        const where =
            rangeDateStart && rangeDateEnd
                ? {
                      createdAt: {
                          [Op.between]: [rangeDateStart, rangeDateEnd],
                      },
                  }
                : null;

        const trades = await Trade.findAll({
            include: [
                {
                    model: Market,
                    as: 'Market',
                    attributes: ['id'],
                    include: [
                        {
                            model: Exchange,
                            as: 'Exchange',
                            attributes: ['name'],
                            where: {
                                name: {
                                    [Op.in]: exchangeNames,
                                },
                            },
                        },
                    ],
                    where: {
                        symbol,
                    },
                },
            ],
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        const tradesList = trades.map((trade) => {
            return dumpTrade(trade);
        });

        return tradesList;
    }
}
