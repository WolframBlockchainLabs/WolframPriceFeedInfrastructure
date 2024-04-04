import chista from '#api/rest-api/chista/chista.js';
import GetDiscreteAggregationTask from '#use-cases/aggregation-tasks/GetDiscreteAggregationTask.js';

const getAggregationTaskController = chista.makeUseCaseRunner(
    GetDiscreteAggregationTask,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default getAggregationTaskController;
