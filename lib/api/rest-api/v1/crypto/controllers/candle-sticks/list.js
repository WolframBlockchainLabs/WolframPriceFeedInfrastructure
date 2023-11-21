import CandleStick from '../../../../../../use-cases/candle-sticks/List.js';
import chista from '../../../../chista/chista.js';

const listCandleSticksController = chista.makeUseCaseRunner(
    CandleStick,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default listCandleSticksController;
