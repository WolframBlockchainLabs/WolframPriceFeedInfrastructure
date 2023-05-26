import { logger } from '../infrastructure/logger/logger.js';
import Collector  from './Base.js';

const level = 'collector';

export class CandleStickCollector extends Collector {
    async fetchData(exchangeInfo, market) {
        await exchangeInfo.loadMarkets();

        try {
            return await exchangeInfo.fetchOHLCV(market);
        } catch (error) {
            console.error('Data did not received');
        }
    }

    async saveData(data, marketId) {
        const { sequelize } = this;

        const { OrderBook } = sequelize;

        const { bids, asks } = data;

        try {
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
