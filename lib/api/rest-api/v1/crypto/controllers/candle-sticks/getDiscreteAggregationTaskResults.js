import chista from '#api/rest-api/chista/chista.js';
import GetDiscreteAggregationTaskResults from '#use-cases/market-records/candle-sticks/GetDiscreteAggregationTaskResults.js';

const getDiscreteAggregationTaskResultsController = chista.makeUseCaseRunner(
    GetDiscreteAggregationTaskResults,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default getDiscreteAggregationTaskResultsController;
