import { Op } from 'sequelize';
import Ticker from '../../domain-model/entities/Ticker.js';
import Market from '../../domain-model/entities/Market.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Base from '../BaseUseCase.js';
import dumpTicker from '../utils/dumps/dumpTicker.js';

class TickersList extends Base {
    static validationRules = {
        symbol: ['required', 'string', 'symbol', 'not_empty'],
        exchangeNames: ['required', 'string', 'not_empty', 'array_params'],
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

        const tickers = await Ticker.findAll({
            include: [
                {
                    model: Market,
                    as: 'Market',
                    required: true,
                    attributes: ['id'],
                    include: [
                        {
                            model: Exchange,
                            as: 'Exchange',
                            required: true,
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

        return {
            data: tickers.map(dumpTicker),
            meta: {
                fetchCount: tickers.length,
            },
        };
    }
}

export default TickersList;
