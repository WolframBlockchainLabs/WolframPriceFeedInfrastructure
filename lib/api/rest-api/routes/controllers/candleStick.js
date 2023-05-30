import CandleStick from '../../../../use-cases/candleStick/List.js';
import chista      from '../../chista.js';

export default {
    list : chista.makeUseCaseRunner(CandleStick, req => ({ ...req.query, ...req.params }))
};
