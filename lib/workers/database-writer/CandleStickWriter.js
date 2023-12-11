import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import CandleStick from '../../domain-model/entities/market-records/CandleStick.js';
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
                type: COLLECTOR_TYPES_DICT.CANDLE_STICK,
            });
        }

        this.logger.debug({
            message: `CandleStick for '${exchange} & ${symbol}' has been ${
                created ? 'saved' : 'found'
            } successfully`,
            context: {
                intervalStart: new Date(payload.intervalStart).toISOString(),
                intervalEnd: new Date(payload.intervalEnd).toISOString(),
                marketId: payload.marketId,
            },
        });
    }
}

export default CandleStickWriter;
