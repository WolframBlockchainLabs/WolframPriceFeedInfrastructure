import TradeList from '../../../../use-cases/trades/List.js';
import chista from '../../chista/chista.js';

export default {
    list: chista.makeUseCaseRunner(TradeList, (req) => ({
        ...req.query,
        ...req.params,
    })),
};
