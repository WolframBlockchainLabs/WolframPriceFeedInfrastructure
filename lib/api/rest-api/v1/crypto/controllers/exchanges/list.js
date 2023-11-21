import ExchangesList from '../../../../../../use-cases/exchanges/List.js';
import chista from '../../../../chista/chista.js';

const listExchangesController = chista.makeUseCaseRunner(
    ExchangesList,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default listExchangesController;
