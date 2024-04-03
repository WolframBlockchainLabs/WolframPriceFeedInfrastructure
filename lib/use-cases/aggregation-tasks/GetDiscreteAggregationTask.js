import AggregationTask from '#domain-model/entities/AggregationTask.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';
import dumpAggregationTask from '#use-cases/utils/dumps/dumpAggregationTask.js';

class GetDiscreteAggregationTask extends BaseUseCase {
    validationRules = {
        id: ['required', 'positive_integer'],
    };

    async execute({ id }) {
        const aggregationTask = await AggregationTask.findOneOrFail({
            where: { id },
        });

        return {
            data: dumpAggregationTask(aggregationTask),
        };
    }
}

export default GetDiscreteAggregationTask;
