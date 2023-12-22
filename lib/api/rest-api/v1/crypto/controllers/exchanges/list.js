import ExchangesList from '#use-cases/exchanges/List.js';
import chista from '#api/rest-api/chista/chista.js';

const listExchangesController = chista.makeUseCaseRunner(
    ExchangesList,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default listExchangesController;
