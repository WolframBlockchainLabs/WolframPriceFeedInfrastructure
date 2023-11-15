import ExchangesList from '../../../../use-cases/exchanges/List.js';
import chista from '../../chista/chista.js';

export default {
    list: chista.makeUseCaseRunner(ExchangesList, (req) => ({
        ...req.query,
        ...req.params,
    })),
};
