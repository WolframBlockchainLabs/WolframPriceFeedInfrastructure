import ExchangeRatesList from '../../../../use-cases/exchange-rates/List.js';
import chista from '../../chista/chista.js';

export default {
    list: chista.makeUseCaseRunner(ExchangeRatesList, (req) => ({
        ...req.query,
        ...req.params,
    })),
};
