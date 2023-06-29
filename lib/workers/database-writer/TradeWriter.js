import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import Trade from '../../domain-model/entities/Trade.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class TradeWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        await Trade.create(payload);

        this.amqpClient.publish(WS_PRICING_QUEUE, {
            exchange,
            symbol,
            payload,
            type: 'Trade',
        });

        this.logger.info(
            `Trade for '${exchange} & ${symbol}' has been saved successfully`,
        );
    }
}

export default TradeWriter;
