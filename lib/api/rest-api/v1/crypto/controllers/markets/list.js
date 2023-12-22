import MarketsList from '#use-cases/markets/List.js';
import chista from '#api/rest-api/chista/chista.js';

const listMarketsController = chista.makeUseCaseRunner(MarketsList, (req) => ({
    ...req.query,
}));

export default listMarketsController;
