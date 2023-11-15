import CandleStick from '../../domain-model/entities/market-records/CandleStick.js';
import Base from '../BaseUseCase.js';
import dumpCandleStick from '../utils/dumps/dumpCandleStick.js';

class CandleSticksList extends Base {
    static validationRules = {
        symbol: ['required', 'string', 'symbol'],
        exchangeNames: ['required', 'string', 'array_params'],
        limit: ['not_empty', 'positive_integer', { default: 5 }],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
        rangeDateStart: ['not_empty', 'iso_timestamp', 'date_compare'],
        rangeDateEnd: ['not_empty', 'iso_timestamp', 'date_compare'],
    };

    async execute(queryParams) {
        const candleSticks = await CandleStick.scope([
            {
                method: ['search', queryParams],
            },
        ]).findAll();

        return {
            data: candleSticks.map(dumpCandleStick),
            meta: {
                fetchCount: candleSticks.length,
            },
        };
    }
}

export default CandleSticksList;
