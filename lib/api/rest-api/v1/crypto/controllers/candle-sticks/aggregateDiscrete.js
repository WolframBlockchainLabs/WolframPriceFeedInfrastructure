import chista from '#api/rest-api/chista/chista.js';
import DiscreteAggregation from '#use-cases/market-records/candle-sticks/DiscreteAggregation.js';

const aggregateDiscreteCandleSticksController = chista.makeUseCaseRunner(
    DiscreteAggregation,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default aggregateDiscreteCandleSticksController;
