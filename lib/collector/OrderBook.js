import { logger } from '../infrastructure/logger/logger.js';
import Collector  from './Base.js';

const level = 'collector';

export class OrderBookCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol } = this;

        await exchangeAPI.loadMarkets();

        try {
            return await exchangeAPI.fetchOrderBook(symbol);
        } catch (error) {
            logger(level).error(`Data did not receive by ${exchangeAPI.name} and ${symbol} market`, error);
        }
    }

    async saveData(data) {
        const { exchange, symbol, sequelize } = this;

        const { OrderBook } = sequelize;

        const { bids, asks } = data;

        try {
            const { marketId } = await this.getMarketInfo();

            await OrderBook.create({
                marketId,
                bids,
                asks
            });
            logger(level).info('Data have saved successfully');
        } catch (error) {
            logger(level).error(`Data did not save by ${exchange} and ${symbol} market`, error);
        }
    }
}
