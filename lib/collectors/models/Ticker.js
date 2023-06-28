import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from '../BaseCollector.js';

class TickerCollector extends BaseCollector {
    queueName = DATABASE_WRITER_QUEUES.ticker;

    async fetchData() {
        const { exchange, exchangeAPI, symbol } = this;

        try {
            return await exchangeAPI.fetchTicker(symbol);
        } catch (error) {
            this.logger.error({
                message: `Could not get Ticker for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData(data, marketId) {
        const { exchange, symbol } = this;

        try {
            await this.publish({
                exchange,
                symbol,
                payload: {
                    marketId,
                    high: data.high,
                    low: data.low,
                    bid: data.bid,
                    bidVolume: data.bidVolume,
                    ask: data.ask,
                    askVolume: data.askVolume,
                    vwap: data.vwap,
                    open: data.open,
                    close: data.close,
                    last: data.last,
                    previousClose: data.previousClose,
                    change: data.change,
                    percentage: data.percentage,
                    average: data.average,
                    baseVolume: data.baseVolume,
                    quoteVolume: data.quoteVolume,
                },
            });

            this.logger.info(
                `Ticker for '${exchange} & ${symbol}' have been sent to the [${this.queueName}] queue`,
            );
        } catch (error) {
            this.logger.error({
                message: `Could not send Ticker for '${exchange} & ${symbol}' to the [${this.queueName}] queue`,
                error,
            });
        }
    }
}

export default TickerCollector;
