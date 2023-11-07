import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import Trade from '../../domain-model/entities/Trade.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class TradeWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        // eslint-disable-next-line no-unused-vars
        const [trade, created] = await Trade.findOrCreate({
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
                type: COLLECTOR_TYPES_DICT.TRADE,
            });
        }

        this.logger.info(
            `Trade for '${exchange} & ${symbol}' has been ${
                created ? 'saved' : 'found'
            } successfully`,
        );
    }
}

export default TradeWriter;
