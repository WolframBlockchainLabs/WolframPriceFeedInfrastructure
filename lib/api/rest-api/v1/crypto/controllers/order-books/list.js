import OrderBooksList from '../../../../../../use-cases/order-books/List.js';
import chista from '../../../../chista/chista.js';

const listOrderBooksController = chista.makeUseCaseRunner(
    OrderBooksList,
    (req) => ({
        ...req.query,
        ...req.params,
    }),
);

export default listOrderBooksController;
