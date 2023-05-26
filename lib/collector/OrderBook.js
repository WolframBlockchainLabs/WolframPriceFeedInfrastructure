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
            console.error('Data did not received');
        }
    }

    async saveData(data) {
        const { sequelize } = this;

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
            console.error('Data did not saved', error);
        }
    }
}
