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
            logger(level).error(`Order books did not receive from ${exchangeAPI.name} for ${symbol} market`, error);
        }
    }

    async saveData(data) {
        const { exchange, symbol, sequelize } = this;

        const { OrderBook } = sequelize;

        try {
            const { bids, asks } = data;

            const { marketId } = await this.getMarketInfo();

            await OrderBook.create({
                marketId,
                bids,
                asks
            });
            logger(level).info('Data have saved successfully');
        } catch (error) {
            logger(level).error(`OrderBook did not save for ${exchange} and ${symbol} market`, error);
        }
    }
}
