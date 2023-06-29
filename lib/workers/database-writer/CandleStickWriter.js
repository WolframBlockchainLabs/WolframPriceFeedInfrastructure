import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import CandleStick from '../../domain-model/entities/CandleStick.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class CandleStickWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        await CandleStick.create(payload);

        this.amqpClient.publish(WS_PRICING_QUEUE, {
            exchange,
            symbol,
            payload,
            type: 'CandleStick',
        });

        this.logger.info(
            `CandleStick for '${exchange} & ${symbol}' has been saved successfully`,
        );
    }
}

export default CandleStickWriter;
