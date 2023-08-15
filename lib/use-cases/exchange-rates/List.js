import { Op } from 'sequelize';
import Market from '../../domain-model/entities/Market.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Base from '../BaseUseCase.js';
import dumpExchangeRate from '../utils/dumps/dumpExchangeRate.js';
import ExchangeRate from '../../domain-model/entities/ExchangeRate.js';

class ExchangeRatesList extends Base {
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

        const exchangeRates = await ExchangeRate.findAll({
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
            order: [['intervalStart', 'DESC']],
            limit,
            offset,
        });

        return {
            data: exchangeRates.map(dumpExchangeRate),
            meta: {
                fetchCount: exchangeRates.length,
            },
        };
    }
}

export default ExchangeRatesList;
