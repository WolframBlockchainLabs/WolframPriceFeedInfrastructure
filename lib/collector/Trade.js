import { logger } from '../infrastructure/logger/logger.js';
import Collector  from './Base.js';

const level = 'collector';

export class TradeCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol } = this;

        await exchangeAPI.loadMarkets();
        try {
            return await exchangeAPI.fetchTrades(symbol);
        } catch (error) {
            logger(level).error(`Trades did not receive from ${exchangeAPI.name} for ${symbol} market`, error);
        }
    }

    async saveData(data) {
        const { exchange, symbol, sequelize } = this;

        const { Trade } = sequelize;


        try {
            const { side, price, amount, timestamp } = data;
            // convert side -> boolean

            const { marketId } = await this.getMarketInfo();

            await Trade.create({
                marketId,
                side,
                price,
                amount,
                timestamp
            });
            logger(level).info('Data have saved successfully');
        } catch (error) {
            logger(level).error(`Trade did not save for ${exchange} and ${symbol} market`, error);
        }
    }
}
