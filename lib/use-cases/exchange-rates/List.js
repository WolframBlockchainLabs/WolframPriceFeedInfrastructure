import dumpExchangeRate from '../utils/dumps/dumpExchangeRate.js';
import ExchangeRate from '#domain-model/entities/market-records/ExchangeRate.js';
import BaseCacheUseCase from '#use-cases/BaseCacheUseCase.js';

class ExchangeRatesList extends BaseCacheUseCase {
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
        const exchangeRates = await ExchangeRate.scope([
            {
                method: ['search', queryParams],
            },
        ]).findAll();

        return {
            data: exchangeRates.map(dumpExchangeRate),
            meta: {
                fetchCount: exchangeRates.length,
            },
        };
    }
}

export default ExchangeRatesList;
