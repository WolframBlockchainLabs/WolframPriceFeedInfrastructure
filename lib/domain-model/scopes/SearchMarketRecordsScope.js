import { Op } from 'sequelize';
import BaseScope from './BaseScope.js';

class SearchMarketRecordsScope extends BaseScope {
    process({
        symbol,
        exchangeNames,
        rangeDateStart,
        rangeDateEnd,
        sortBy,
        orderBy,
        limit,
        offset,
    }) {
        const where =
            rangeDateStart && rangeDateEnd
                ? {
                      intervalStart: {
                          [Op.between]: [rangeDateStart, rangeDateEnd],
                      },
                  }
                : null;

        return {
            include: [
                {
                    model: this.sequelize.models.Market,
                    as: 'Market',
                    attributes: ['id', 'symbol'],
                    include: [
                        {
                            model: this.sequelize.models.Exchange,
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
            order: [[sortBy ?? 'intervalStart', orderBy ?? 'DESC']],
            limit,
            offset,
        };
    }
}

export default SearchMarketRecordsScope;
