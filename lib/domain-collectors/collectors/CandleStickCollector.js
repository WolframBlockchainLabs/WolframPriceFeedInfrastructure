import { DATABASE_WRITER_QUEUES } from '#constants/amqp/rabbit-queues.js';
import {
    MILLISECONDS_IN_A_MINUTE,
    MILLISECONDS_IN_A_SECOND,
} from '#constants/timeframes.js';
import BaseCollector from './BaseCollector.js';

class CandleStickCollector extends BaseCollector {
    static TIMEFRAMES = {
        SECOND: '1s',
        MINUTE: '1m',
    };

    QUEUE_NAME = DATABASE_WRITER_QUEUES.candleStick;

    async fetchData({ intervalStart, intervalEnd }) {
        const { exchangeAPI, symbol } = this;

        const timeframe = this.getTimeframe({ intervalStart, intervalEnd });
        const limit = this.getLimit({ intervalStart, intervalEnd, timeframe });

        return exchangeAPI.fetchOHLCV(symbol, timeframe, intervalStart, limit);
    }

    async saveData(fetchedData, collectorMeta) {
        const { exchange, symbol } = this;
        const { intervalStart, intervalEnd } = collectorMeta;

        const charts = fetchedData.filter(([timestamp]) => {
            return timestamp >= intervalStart && timestamp <= intervalEnd;
        });

        await this.publish(
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

    getTimeframe({ intervalStart, intervalEnd }) {
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

    getLimit({ intervalStart, intervalEnd, timeframe }) {
        switch (timeframe) {
            case CandleStickCollector.TIMEFRAMES.SECOND: {
                return Math.ceil(
                    (intervalEnd - intervalStart) / MILLISECONDS_IN_A_SECOND,
                );
            }
            case CandleStickCollector.TIMEFRAMES.MINUTE: {
                return Math.ceil(
                    (intervalEnd - intervalStart) / MILLISECONDS_IN_A_MINUTE,
                );
            }
        }
    }

    formatAggregationInterval({ intervalStart, intervalEnd }) {
        return {
            intervalStart: intervalStart - MILLISECONDS_IN_A_MINUTE,
            intervalEnd: intervalEnd - MILLISECONDS_IN_A_MINUTE,
        };
    }
}

export default CandleStickCollector;
