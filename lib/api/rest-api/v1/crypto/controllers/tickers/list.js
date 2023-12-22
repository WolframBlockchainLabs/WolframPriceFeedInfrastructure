import Ticker from '#use-cases/tickers/List.js';
import chista from '#api/rest-api/chista/chista.js';

const listTickersController = chista.makeUseCaseRunner(Ticker, (req) => ({
    ...req.query,
    ...req.params,
}));

export default listTickersController;
