import { COLLECTOR_TYPES_DICT } from '../../constants/collectorTypes.js';
import { WS_PRICING_QUEUE } from '../../constants/rabbimqQueues.js';
import ExchangeRate from '../../domain-model/entities/ExchangeRate.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class ExchangeRateWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        // eslint-disable-next-line no-unused-vars
        const [exchangeRate, created] = await ExchangeRate.findOrCreate({
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
                type: COLLECTOR_TYPES_DICT.EXCHANGE_RATE,
            });
        }

        this.logger.info(
            `ExchangeRate for '${exchange} & ${symbol}' has been ${
                created ? 'saved' : 'found'
            } successfully`,
        );
    }
}

export default ExchangeRateWriter;
