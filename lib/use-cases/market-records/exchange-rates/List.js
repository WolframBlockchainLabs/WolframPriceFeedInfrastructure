import dumpExchangeRate from '../../utils/dumps/dumpExchangeRate.js';
import ExchangeRate from '#domain-model/entities/market-records/ExchangeRate.js';
import BaseMarketRecordUseCase from '../BaseMarketRecordUseCase.js';

class ExchangeRatesList extends BaseMarketRecordUseCase {
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
