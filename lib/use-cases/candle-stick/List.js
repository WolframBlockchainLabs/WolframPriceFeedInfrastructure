import { Op } from 'sequelize';
import CandleStick from '../../domain-model/entities/CandleStick.js';
import Market from '../../domain-model/entities/Market.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Base from '../BaseUseCase.js';
import dumpCandleStick from '../utils/dumps/dumpCandleStick.js';

class CandleSticksList extends Base {
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
                      intervalStart: {
                          [Op.between]: [rangeDateStart, rangeDateEnd],
                      },
                  }
                : null;

        const candleSticks = await CandleStick.findAll({
            include: [
                {
                    model: Market,
                    as: 'Market',
                    attributes: ['id', 'symbol'],
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
            order: [['intervalStart', 'DESC']],
            limit,
            offset,
        });

        return {
            data: candleSticks.map(dumpCandleStick),
            meta: {
                fetchCount: candleSticks.length,
            },
        };
    }
}

export default CandleSticksList;
