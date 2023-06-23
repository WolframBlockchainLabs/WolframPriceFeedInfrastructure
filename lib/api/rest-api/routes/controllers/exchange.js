import ExchangesList from '../../../../use-cases/exchange/List.js';
import chista from '../../chista.js';

export default {
    list: chista.makeUseCaseRunner(ExchangesList, (req) => ({
        ...req.query,
        ...req.params,
    })),
};
