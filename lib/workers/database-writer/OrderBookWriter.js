import { COLLECTOR_TYPES_DICT } from '#constants/collectorTypes.js';
import OrderBook from '#domain-model/entities/market-records/OrderBook.js';
import BaseMarketRecordWriter from './BaseMarketRecordWriter.js';

class OrderBookWriter extends BaseMarketRecordWriter {
    SequelizeModel = OrderBook;

    type = COLLECTOR_TYPES_DICT.ORDER_BOOK;
}

export default OrderBookWriter;
