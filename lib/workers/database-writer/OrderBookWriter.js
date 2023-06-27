import OrderBook from '../../domain-model/entities/OrderBook.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class OrderBookWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        await OrderBook.create(payload);

        this.logger.info(
            `OrderBook for '${exchange} & ${symbol}' have been saved successfully`,
        );
    }
}

export default OrderBookWriter;
