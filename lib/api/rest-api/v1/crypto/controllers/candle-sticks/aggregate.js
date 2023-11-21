import AggregateCandleSticks from '../../../../../../use-cases/candle-sticks/Aggregate.js';
import chista from '../../../../chista/chista.js';

const aggregateCandleSticksController = chista.makeUseCaseRunner(
    AggregateCandleSticks,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default aggregateCandleSticksController;
