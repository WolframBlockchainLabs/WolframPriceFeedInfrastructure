import AggregateCandleSticks from '#use-cases/market-records/candle-sticks/Aggregate.js';
import chista from '#api/rest-api/chista/chista.js';

const aggregateCandleSticksController = chista.makeUseCaseRunner(
    AggregateCandleSticks,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default aggregateCandleSticksController;
