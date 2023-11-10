import { DATABASE_WRITER_QUEUES } from '../../constants/rabbimqQueues.js';
import BaseCollector from './BaseCollector.js';

class TickerCollector extends BaseCollector {
    QUEUE_NAME = DATABASE_WRITER_QUEUES.ticker;

    async fetchData() {
        const { exchangeAPI, symbol } = this;

        return exchangeAPI.fetchTicker(symbol);
    }

    async saveData(data) {
        const { exchange, symbol } = this;

        this.publish({
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
        });

        this.logger.debug(
            `Ticker for '${exchange} & ${symbol}' has been sent to the [${this.QUEUE_NAME}] queue`,
        );
    }
}

export default TickerCollector;
