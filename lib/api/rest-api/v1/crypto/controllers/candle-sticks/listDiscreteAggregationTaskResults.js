import chista from '#api/rest-api/chista/chista.js';
import ListDiscreteAggregationTaskResults from '#use-cases/market-records/candle-sticks/ListDiscreteAggregationTaskResults.js';

const listDiscreteAggregationTaskResultsController = chista.makeUseCaseRunner(
    ListDiscreteAggregationTaskResults,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default listDiscreteAggregationTaskResultsController;
