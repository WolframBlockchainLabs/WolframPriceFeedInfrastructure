import TradeList from '../../../../../../use-cases/trades/List.js';
import chista from '../../../../chista/chista.js';

const listTradesController = chista.makeUseCaseRunner(TradeList, (req) => ({
    ...req.query,
    ...req.params,
}));

export default listTradesController;
