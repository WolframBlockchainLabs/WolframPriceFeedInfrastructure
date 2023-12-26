import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import Base from '../BaseUseCase.js';
import dumpCandleStick from '../utils/dumps/dumpCandleStick.js';

class CandleSticksList extends Base {
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
        sortBy: [
            'not_empty',
            { one_of: ['intervalStart', 'intervalEnd', 'createdAt'] },
        ],
        orderBy: ['not_empty', { one_of: ['ASC', 'DESC'] }],
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
