import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import { MILLISECONDS_IN_A_MINUTE } from '../../constants/timeframes.js';
import BaseCollector from './BaseCollector.js';

class CandleStickCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.candleStick;

    async fetchData() {
        const { exchangeAPI, symbol, intervalStart, intervalEnd } = this;

        const limit = Math.ceil(
            (intervalEnd - intervalStart) / MILLISECONDS_IN_A_MINUTE,
        );

        return exchangeAPI.fetchOHLCV(symbol, '1m', intervalStart, limit);
    }

    async saveData(charts) {
        const { exchange, symbol } = this;

        this.publish({
            charts,
        });

        this.logger.debug({
            message: `CandleStick for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
            context: this.getLogContext(),
        });
    }
}

export default CandleStickCollector;
