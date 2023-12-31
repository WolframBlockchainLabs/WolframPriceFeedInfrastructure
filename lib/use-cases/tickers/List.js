import Ticker from '#domain-model/entities/market-records/Ticker.js';
import BaseCacheUseCase from '#use-cases/BaseCacheUseCase.js';
import dumpTicker from '../utils/dumps/dumpTicker.js';

class TickersList extends BaseCacheUseCase {
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
        const tickers = await Ticker.scope([
            {
                method: ['search', queryParams],
            },
        ]).findAll();

        return {
            data: tickers.map(dumpTicker),
            meta: {
                fetchCount: tickers.length,
            },
        };
    }
}

export default TickersList;
