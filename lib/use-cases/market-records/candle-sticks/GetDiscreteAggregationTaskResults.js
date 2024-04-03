import AggregationTask from '#domain-model/entities/AggregationTask.js';
import DiscreteAggregationResult from '#domain-model/entities/DiscreteAggregationResult.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';
import dumpAggregationTask from '#use-cases/utils/dumps/dumpAggregationTask.js';
import dumpDiscreteAggregationTaskResult from '#use-cases/utils/dumps/dumpDiscreteAggregationTaskResult.js';

class GetDiscreteAggregationTaskResults extends BaseUseCase {
    validationRules = {
        id: ['required', 'positive_integer'],
    };

    async execute({ id }) {
        const aggregationTask = await AggregationTask.findOneOrFail({
            where: {
                id,
                type: AggregationTask.TYPE.CANDLES_DISCRETE_AGGREGATION,
            },
            include: [
                {
                    model: DiscreteAggregationResult,
                },
            ],
        });

        return {
            data: {
                task: dumpAggregationTask(aggregationTask),
                results: aggregationTask.DiscreteAggregationResults?.map(
                    dumpDiscreteAggregationTaskResult,
                ),
            },
        };
    }
}

export default GetDiscreteAggregationTaskResults;
