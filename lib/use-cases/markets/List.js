import { Op } from 'sequelize';
import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import dumpMarket from '../utils/dumps/dumpMarket.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';

class MarketsList extends BaseUseCase {
    validationRules = {
        limit: [
            'not_empty',
            'positive_integer',
            { max_number: this.maxItemsRetrieved },
            { default: 20 },
        ],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
        exchangeNames: { list_of: ['not_null', 'not_empty', 'string'] },
        tokenNames: { list_of: ['not_null', 'not_empty', 'string'] },
    };

    async execute({ exchangeNames, tokenNames, limit, offset }) {
        const { rows: marketsList, count } = await Market.findAndCountAll({
            ...(tokenNames && {
                where: {
                    [Op.or]: [
                        {
                            base: {
                                [Op.in]: tokenNames,
                            },
                        },
                        {
                            quote: {
                                [Op.in]: tokenNames,
                            },
                        },
                    ],
                },
            }),
            include: [
                {
                    model: Exchange,
                    ...(exchangeNames && {
                        where: {
                            name: {
                                [Op.in]: exchangeNames,
                            },
                        },
                    }),
                },
            ],
            limit,
            offset,
        });

        return {
            data: marketsList.map(dumpMarket),
            meta: {
                fetchCount: marketsList.length,
                totalCount: count,
            },
        };
    }
}

export default MarketsList;
