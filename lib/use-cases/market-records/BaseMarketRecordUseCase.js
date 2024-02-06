import BaseUseCase from '#use-cases/BaseUseCase.js';

class BaseMarketRecordUseCase extends BaseUseCase {
    validationRules = {
        symbol: ['required', 'string'],
        exchangeNames: [
            'required',
            { list_of: ['not_null', 'not_empty', 'string'] },
        ],
        limit: [
            'not_empty',
            'positive_integer',
            { max_number: this.config.apiLimits.maxItemsRetrieved },
            { default: 5 },
        ],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
        rangeDateStart: [
            'required',
            'not_empty',
            'iso_timestamp',
            { date_compare: this.config.apiLimits.maxDateDiff },
        ],
        rangeDateEnd: [
            'required',
            'not_empty',
            'iso_timestamp',
            { date_compare: this.config.apiLimits.maxDateDiff },
        ],
        orderBy: ['not_empty', { one_of: ['ASC', 'DESC'] }],
    };

    shouldCache({ rangeDateEnd }) {
        return Date.now() > new Date(rangeDateEnd).getTime();
    }
}

export default BaseMarketRecordUseCase;
