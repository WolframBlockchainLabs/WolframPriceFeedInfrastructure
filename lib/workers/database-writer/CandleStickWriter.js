import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import CandleStick from '../../domain-model/entities/CandleStick.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class CandleStickWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        // eslint-disable-next-line no-unused-vars
        const [candleStick, created] = await CandleStick.findOrCreate({
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
                type: 'CandleStick',
            });
        }

        this.logger.info(
            `CandleStick for '${exchange} & ${symbol}' has been ${
                created ? 'saved' : 'found'
            } successfully`,
        );
    }
}

export default CandleStickWriter;
