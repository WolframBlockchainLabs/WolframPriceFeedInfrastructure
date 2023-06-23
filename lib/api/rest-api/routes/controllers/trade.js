import TradeList from '../../../../use-cases/trade/List.js';
import chista from '../../chista.js';

export default {
    list: chista.makeUseCaseRunner(TradeList, (req) => ({
        ...req.query,
        ...req.params,
    })),
};
