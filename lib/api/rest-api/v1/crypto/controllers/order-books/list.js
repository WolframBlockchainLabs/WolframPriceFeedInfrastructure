import OrderBooksList from '#use-cases/market-records/order-books/List.js';
import chista from '#api/rest-api/chista/chista.js';

const listOrderBooksController = chista.makeUseCaseRunner(
    OrderBooksList,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default listOrderBooksController;
