import chista from '#api/rest-api/chista/chista.js';
import DiscreteCandleSticksAggregationUseCase from '#use-cases/market-records/candle-sticks/DiscreteCandleSticksAggregationUseCase.js';

const aggregateDiscreteCandleSticksController = chista.makeUseCaseRunner(
    DiscreteCandleSticksAggregationUseCase,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default aggregateDiscreteCandleSticksController;
