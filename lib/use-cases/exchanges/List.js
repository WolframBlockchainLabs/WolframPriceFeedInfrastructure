import Exchange from '#domain-model/entities/Exchange.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';
import dumpExchange from '../utils/dumps/dumpExchange.js';

class ExchangesList extends BaseUseCase {
    validationRules = {
        limit: [
            'not_empty',
            'positive_integer',
            { max_number: this.config.apiLimits.maxItemsRetrieved },
            { default: 20 },
        ],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
    };

    async execute({ limit, offset }) {
        const { rows: exchangesList, count } = await Exchange.findAndCountAll({
            limit,
            offset,
        });

        return {
            data: exchangesList.map(dumpExchange),
            meta: {
                fetchCount: exchangesList.length,
                totalCount: count,
            },
        };
    }
}

export default ExchangesList;
