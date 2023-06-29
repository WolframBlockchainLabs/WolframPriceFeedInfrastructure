import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import Ticker from '../../domain-model/entities/Ticker.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class TickerWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        await Ticker.create(payload);

        this.amqpClient.publish(WS_PRICING_QUEUE, {
            exchange,
            symbol,
            payload,
            type: 'Ticker',
        });

        this.logger.info(
            `Ticker for '${exchange} & ${symbol}' has been saved successfully`,
        );
    }
}

export default TickerWriter;
