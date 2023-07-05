import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from '../BaseCollector.js';

class CandleStickCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.candleStick;

    async fetchData() {
        const { exchange, exchangeAPI, symbol, intervalStart, intervalEnd } =
            this;

        const sinceTimestamp = Date.now() - (intervalEnd - intervalStart);

        try {
            return await exchangeAPI.fetchOHLCV(symbol, '1m', sinceTimestamp);
        } catch (error) {
            this.logger.error({
                message: `Could not get CandleStick for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData(charts) {
        const { exchange, symbol } = this;

        this.publish({
            charts,
        });

        this.logger.info(
            `CandleStick for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
        );
    }
}

export default CandleStickCollector;
