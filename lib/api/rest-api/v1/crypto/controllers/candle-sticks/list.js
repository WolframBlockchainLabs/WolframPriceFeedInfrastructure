import CandleStick from '#use-cases/market-records/candle-sticks/List.js';
import chista from '#api/rest-api/chista/chista.js';

const listCandleSticksController = chista.makeUseCaseRunner(
    CandleStick,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default listCandleSticksController;
