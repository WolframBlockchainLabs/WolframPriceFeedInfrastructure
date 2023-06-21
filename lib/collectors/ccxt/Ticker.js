import Ticker     from '../../domain-model/Ticker.js';
import { logger } from '../../infrastructure/logger/logger.js';
import Collector  from '../Base.js';

const level = 'collector';

export class TickerCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol } = this;

        await exchangeAPI.loadMarkets();

        try {
            return await exchangeAPI.fetchTicker(symbol);
        } catch (error) {
            logger(level).error(`Ticker did not receive from ${exchangeAPI.name} for ${symbol} market`, error);
        }
    }

    async saveData(data, marketId) {
        const { exchange, symbol } = this;


        try {
            const { high, low, bid, bidVolume, ask, askVolume, vwap,
                open, close, last, previousClose, change, percentage,
                average, baseVolume, quoteVolume } = data;

            await Ticker.create({
                marketId,
                high,
                low,
                bid,
                bidVolume,
                ask,
                askVolume,
                vwap,
                open,
                close,
                last,
                previousClose,
                change,
                percentage,
                average,
                baseVolume,
                quoteVolume
            });
            logger(level).info('Data have saved successfully');
        } catch (error) {
            logger(level).error(`Ticker did not save for ${exchange} and ${symbol} market`, error);
        }
    }
}
