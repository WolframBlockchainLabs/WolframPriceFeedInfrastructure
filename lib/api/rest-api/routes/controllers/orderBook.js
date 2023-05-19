import OrderBooksList from '../../../../use-cases/orderBook/List.js';
import chista         from '../../chista.js';

export default {
    list : chista.makeUseCaseRunner(OrderBooksList, req => ({ ...req.query, ...req.params }))
};
