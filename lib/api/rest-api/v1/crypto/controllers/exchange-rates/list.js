import ExchangeRatesList from '#use-cases/market-records/exchange-rates/List.js';
import chista from '#api/rest-api/chista/chista.js';

const listExchangeRatesController = chista.makeUseCaseRunner(
    ExchangeRatesList,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default listExchangeRatesController;
