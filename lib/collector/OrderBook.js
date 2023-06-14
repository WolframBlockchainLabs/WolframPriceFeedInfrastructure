import { logger } from '../infrastructure/logger/logger.js';
import Collector  from './Base.js';

const level = 'collector';

export class OrderBookCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol } = this;

        try {
            await exchangeAPI.loadMarkets();

            return await exchangeAPI.fetchOrderBook(symbol);
        } catch (error) {
            logger(level).error(`Order books did not receive from ${exchangeAPI.name} for ${symbol} market`, error.message);
        }
    }

    async saveData({ bids, asks }, marketId) {
        const { exchange, symbol, sequelize:{ OrderBook } } = this;

        try {
            const createdOrderBook = await OrderBook.create({
                marketId,
                bids,
                asks
            });

            logger(level).info(`OrderBook data have saved successfully with ${createdOrderBook.id}`);
        } catch (error) {
            logger(level).error(`OrderBook did not save for ${exchange} and ${symbol} market`, error.message);
        }
    }
}
