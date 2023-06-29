import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import OrderBook from '../../domain-model/entities/OrderBook.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class OrderBookWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        await OrderBook.create(payload);

        this.amqpClient.publish(WS_PRICING_QUEUE, {
            exchange,
            symbol,
            payload,
            type: 'OrderBook',
        });

        this.logger.info(
            `OrderBook for '${exchange} & ${symbol}' has been saved successfully`,
        );
    }
}

export default OrderBookWriter;
