import ExchangeRatesList from '../../../../../../use-cases/exchange-rates/List.js';
import chista from '../../../../chista/chista.js';

const listExchangeRatesController = chista.makeUseCaseRunner(
    ExchangeRatesList,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default listExchangeRatesController;
