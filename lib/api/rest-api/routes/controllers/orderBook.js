import OrderBooksList from '../../../../use-cases/order-book/List.js';
import chista from '../../chista/chista.js';

export default {
    list: chista.makeUseCaseRunner(OrderBooksList, (req) => ({
        ...req.query,
        ...req.params,
    })),
};
