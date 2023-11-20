import Ticker from '../../../../use-cases/tickers/List.js';
import chista from '../../chista/chista.js';

export default {
    list: chista.makeUseCaseRunner(Ticker, (req) => ({
        ...req.query,
        ...req.params,
    })),
};
