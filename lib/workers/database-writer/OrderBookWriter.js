import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import OrderBook from '../../domain-model/entities/OrderBook.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class OrderBookWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        // eslint-disable-next-line no-unused-vars
        const [orderBook, created] = await OrderBook.findOrCreate({
            where: {
                intervalStart: payload.intervalStart,
                intervalEnd: payload.intervalEnd,
                marketId: payload.marketId,
            },
            defaults: {
                ...payload,
            },
        });

        if (created) {
            this.amqpClient.publish(WS_PRICING_QUEUE, {
                exchange,
                symbol,
                payload,
                type: COLLECTOR_TYPES_DICT.ORDER_BOOK,
            });
        }

        this.logger.debug(
            `OrderBook for '${exchange} & ${symbol}' has been ${
                created ? 'saved' : 'found'
            } successfully`,
        );
    }
}

export default OrderBookWriter;
