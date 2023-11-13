import Ticker from '../../domain-model/entities/market-records/Ticker.js';
import Base from '../BaseUseCase.js';
import dumpTicker from '../utils/dumps/dumpTicker.js';

class TickersList extends Base {
    static validationRules = {
        symbol: ['required', 'string', 'symbol', 'not_empty'],
        exchangeNames: ['required', 'string', 'not_empty', 'array_params'],
        limit: ['not_empty', 'positive_integer', { default: 5 }],
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
