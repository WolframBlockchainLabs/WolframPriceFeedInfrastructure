import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from '../BaseCollector.js';

class TradeCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.trade;

    async fetchData() {
        const { exchange, exchangeAPI, symbol } = this;

        const sinceTime = exchangeAPI.milliseconds() - 60000;

        try {
            const fetchedData = await exchangeAPI.fetchTrades(
                symbol,
                sinceTime,
            );

            const data = fetchedData.map((element) => {
                const { side, price, amount, timestamp } = element;

                const sideNum = +(side === 'sell');

                return [sideNum, price, amount, timestamp];
            });

            return data;
        } catch (error) {
            this.logger.error({
                message: `Could not get Trade for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData(tradesInfo) {
        const { exchange, symbol } = this;

        this.publish({
            tradesInfo,
        });

        this.logger.info(
            `Trade for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
        );
    }
}

export default TradeCollector;
