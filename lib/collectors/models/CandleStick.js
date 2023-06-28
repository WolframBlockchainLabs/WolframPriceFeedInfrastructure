import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from '../BaseCollector.js';

class CandleStickCollector extends BaseCollector {
    queueName = DATABASE_WRITER_QUEUES.candleStick;

    async fetchData() {
        const { exchange, exchangeAPI, symbol } = this;

        const fromTimestamp = exchangeAPI.milliseconds() - 86400;

        try {
            return await exchangeAPI.fetchOHLCV(symbol, '1m', fromTimestamp);
        } catch (error) {
            this.logger.error({
                message: `Could not get CandleStick for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData(charts, marketId) {
        const { exchange, symbol } = this;

        try {
            await this.publish({
                exchange,
                symbol,
                payload: {
                    marketId,
                    charts,
                },
            });

            this.logger.info(
                `CandleStick for '${exchange} & ${symbol}' have been sent to the [${this.queueName}] queue`,
            );
        } catch (error) {
            this.logger.error({
                message: `Could not send CandleStick for '${exchange} & ${symbol}' to the [${this.queueName}] queue`,
                error,
            });
        }
    }
}

export default CandleStickCollector;
