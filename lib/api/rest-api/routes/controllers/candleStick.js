import CandleStick from '../../../../use-cases/candle-stick/List.js';
import chista from '../../chista/chista.js';

export default {
    list: chista.makeUseCaseRunner(CandleStick, (req) => ({
        ...req.query,
        ...req.params,
    })),
};
