import Trade from '#domain-model/entities/market-records/Trade.js';
import BaseCacheUseCase from '#use-cases/BaseCacheUseCase.js';
import dumpTrade from '../utils/dumps/dumpTrade.js';

class TradesList extends BaseCacheUseCase {
    static validationRules = {
        symbol: ['required', 'string'],
        exchangeNames: [
            'required',
            { list_of: ['not_null', 'not_empty', 'string'] },
        ],
        limit: [
            'not_empty',
            'positive_integer',
            { max_number: 1000 },
            { default: 5 },
        ],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
        rangeDateStart: ['not_empty', 'iso_timestamp', 'date_compare'],
        rangeDateEnd: ['not_empty', 'iso_timestamp', 'date_compare'],
    };

    async execute(queryParams) {
        const trades = await Trade.scope([
            {
                method: ['search', queryParams],
            },
        ]).findAll();

        return {
            data: trades.map(dumpTrade),
            meta: {
                fetchCount: trades.length,
            },
        };
    }
}

export default TradesList;
