import { DATABASE_WRITER_QUEUES } from '#constants/rabbimqQueues.js';
import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import BaseCollector from './BaseCollector.js';

class CandleStickCollector extends BaseCollector {
    static TIMEFRAMES = {
        SECOND: '1s',
        MINUTE: '1m',
    };

    QUEUE_NAME = DATABASE_WRITER_QUEUES.candleStick;

    async fetchData({ intervalStart, intervalEnd }) {
        const { exchangeAPI, symbol } = this;

        const limit = Math.ceil(
            (intervalEnd - intervalStart) / MILLISECONDS_IN_A_MINUTE,
        );
        const timeframe = this.getTimeframeSize({ intervalStart, intervalEnd });

        return exchangeAPI.fetchOHLCV(symbol, timeframe, intervalStart, limit);
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

    getTimeframeSize({ intervalStart, intervalEnd }) {
        const diff = intervalEnd - intervalStart;

        if (
            diff < MILLISECONDS_IN_A_MINUTE &&
            this.exchangeAPI.timeframes[CandleStickCollector.TIMEFRAMES.SECOND]
        ) {
            return CandleStickCollector.TIMEFRAMES.SECOND;
        } else {
            return CandleStickCollector.TIMEFRAMES.MINUTE;
        }
    }
}

export default CandleStickCollector;
