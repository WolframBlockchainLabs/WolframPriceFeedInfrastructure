import DiscreteAggregationResult from '#domain-model/entities/DiscreteAggregationResult.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';
import dumpDiscreteAggregationTaskResult from '#use-cases/utils/dumps/dumpDiscreteAggregationTaskResult.js';

class ListDiscreteAggregationTaskResults extends BaseUseCase {
    validationRules = {
        symbols: { list_of: ['not_null', 'not_empty', 'string'] },
        exchangeNames: { list_of: ['not_null', 'not_empty', 'string'] },
        rangeDateStart: ['not_empty', 'iso_timestamp', 'date_compare'],
        rangeDateEnd: ['not_empty', 'iso_timestamp', 'date_compare'],
        timeframeMinutes: {
            list_of: ['positive_integer', { max_number: 32768 }],
        },
        limit: [
            'not_empty',
            'positive_integer',
            { max_number: this.maxItemsRetrieved },
            { default: 5 },
        ],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
    };

    async execute(query) {
        const aggregationResults =
            await DiscreteAggregationResult.findAggregations(query);

        return {
            data: aggregationResults.map(dumpDiscreteAggregationTaskResult),
        };
    }
}

export default ListDiscreteAggregationTaskResults;
