import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import OrderBook from '../../domain-model/entities/market-records/OrderBook.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class OrderBookWriter extends BaseAMQPWorker {
    SequelizeModel = OrderBook;

    type = COLLECTOR_TYPES_DICT.OrderBook;
}

export default OrderBookWriter;
