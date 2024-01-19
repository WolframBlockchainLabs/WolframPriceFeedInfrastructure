import TradeList from '#use-cases/market-records/trades/List.js';
import chista from '#api/rest-api/chista/chista.js';

const listTradesController = chista.makeUseCaseRunner(TradeList, (req) => ({
    ...req.query,
    ...req.params,
}));

export default listTradesController;
