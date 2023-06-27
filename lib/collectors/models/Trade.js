import DATABASE_WRITER_QUEUES from '../../constants/databaseWriterQueues.js';
import BaseCollector from '../BaseCollector.js';

class TradeCollector extends BaseCollector {
    queueName = DATABASE_WRITER_QUEUES.trade;

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

    async saveData(tradesInfo, marketId) {
        const { exchange, symbol } = this;

        try {
            await this.publish({
                exchange,
                symbol,
                payload: {
                    marketId,
                    tradesInfo,
                },
            });

            this.logger.info(
                `Trade for '${exchange} & ${symbol}' have been saved successfully`,
            );
        } catch (error) {
            this.logger.error({
                message: `Could not save Trade for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }
}

export default TradeCollector;
