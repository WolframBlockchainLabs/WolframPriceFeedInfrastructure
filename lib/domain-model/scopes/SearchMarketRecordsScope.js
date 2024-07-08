import { Op } from 'sequelize';
import BaseScope from './BaseScope.js';

class SearchMarketRecordsScope extends BaseScope {
    process({
        symbol,
        exchangeNames,
        rangeDateStart,
        rangeDateEnd,
        orderBy,
        limit,
        offset,
    }) {
        return {
            include: [
                {
                    model: this.sequelize.models.Market,
                    attributes: ['id', 'symbol'],
                    include: [
                        {
                            model: this.sequelize.models.Exchange,
                            attributes: ['id', 'name'],
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
            where: {
                intervalStart: {
                    [Op.gte]: rangeDateStart,
                    [Op.lte]: rangeDateEnd,
                },
            },
            order: [['intervalStart', orderBy ?? 'DESC']],
            limit,
            offset,
        };
    }
}

export default SearchMarketRecordsScope;
