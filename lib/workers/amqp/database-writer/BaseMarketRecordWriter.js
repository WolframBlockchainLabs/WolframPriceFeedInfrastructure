import { WS_PRICING_QUEUE } from '#constants/amqp/rabbit-queues.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class BaseMarketRecordWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload, collectorTraceId }) {
        const [, created] = await this.SequelizeModel.findOrCreate({
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
            this.amqpClient.sendToQueue(WS_PRICING_QUEUE, {
                exchange,
                symbol,
                payload,
                type: this.type,
                collectorTraceId,
            });
        }

        this.logger.debug({
            message: `${this.type} for '${exchange} & ${symbol}' has been ${
                created ? 'saved' : 'found'
            } successfully`,
            context: {
                intervalStart: new Date(payload.intervalStart).toISOString(),
                intervalEnd: new Date(payload.intervalEnd).toISOString(),
                marketId: payload.marketId,
                collectorTraceId,
            },
        });
    }
}

export default BaseMarketRecordWriter;
