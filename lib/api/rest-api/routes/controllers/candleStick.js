import CandleStick from '../../../../use-cases/candle-sticks/List.js';
import AggregateCandleSticks from '../../../../use-cases/candle-sticks/Aggregate.js';
import chista from '../../chista/chista.js';

export default {
    list: chista.makeUseCaseRunner(CandleStick, (req) => ({
        ...req.query,
        ...req.params,
    })),
    aggregate: chista.makeUseCaseRunner(AggregateCandleSticks, (req) => ({
        ...req.query,
        ...req.params,
    })),
};
