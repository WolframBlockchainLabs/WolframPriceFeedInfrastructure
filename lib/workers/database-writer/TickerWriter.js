import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import Ticker from '../../domain-model/entities/Ticker.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class TickerWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        // eslint-disable-next-line no-unused-vars
        const [ticker, created] = await Ticker.findOrCreate({
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
                type: COLLECTOR_TYPES_DICT.TICKER,
            });
        }

        this.logger.debug(
            `Ticker for '${exchange} & ${symbol}' has been ${
                created ? 'saved' : 'found'
            } successfully`,
        );
    }
}

export default TickerWriter;
