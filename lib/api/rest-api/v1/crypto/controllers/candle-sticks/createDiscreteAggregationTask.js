import chista from '#api/rest-api/chista/chista.js';
import CreateDiscreteAggregationTask from '#use-cases/market-records/candle-sticks/CreateDiscreteAggregationTask.js';

const createDiscreteAggregationTaskController = chista.makeUseCaseRunner(
    CreateDiscreteAggregationTask,
    (req) => ({
        ...req.body,
    }),
);

export default createDiscreteAggregationTaskController;
