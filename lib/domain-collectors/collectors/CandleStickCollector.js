import { DATABASE_WRITER_QUEUES } from '#constants/rabbimqQueues.js';
import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import BaseCollector from './BaseCollector.js';

class CandleStickCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.candleStick;

    async fetchData({ intervalStart, intervalEnd }) {
        const { exchangeAPI, symbol } = this;

        const limit = Math.ceil(
            (intervalEnd - intervalStart) / MILLISECONDS_IN_A_MINUTE,
        );

        return exchangeAPI.fetchOHLCV(symbol, '1m', intervalStart, limit);
    }

    async saveData(charts, collectorMeta) {
        const { exchange, symbol } = this;

        this.publish(
            {
                charts,
            },
            collectorMeta,
        );

        this.logger.debug({
            message: `CandleStick for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
            context: this.getLogContext(collectorMeta),
        });
    }
}

export default CandleStickCollector;
