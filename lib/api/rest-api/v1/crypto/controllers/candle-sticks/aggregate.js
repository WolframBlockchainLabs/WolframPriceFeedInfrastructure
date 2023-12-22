import AggregateCandleSticks from '#use-cases/candle-sticks/Aggregate.js';
import chista from '#api/rest-api/chista/chista.js';

const aggregateCandleSticksController = chista.makeUseCaseRunner(
    AggregateCandleSticks,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default aggregateCandleSticksController;
