import MarketsList from '../../../../use-cases/markets/List.js';
import chista from '../../chista/chista.js';

export default {
    list: chista.makeUseCaseRunner(MarketsList, (req) => ({
        ...req.query,
    })),
};
