import { logger } from '../infrastructure/logger/logger.js';
import Collector  from './Base.js';

const level = 'collector';

export class TradeCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol, interval } = this;

        await exchangeAPI.loadMarkets();

        const sinceTime = Date.now() - interval;

        try {
            const fetchedData = await exchangeAPI.fetchTrades(symbol, sinceTime);

            const data = fetchedData.map(element => {
                const { side, price, amount, timestamp } = element;

                const sideNum = +(side === 'sell');

                return [ sideNum, price, amount, timestamp ];
            });

            return data;
        } catch (error) {
            logger(level).error(`Trades did not receive from ${exchangeAPI.name} for ${symbol} market`, error);
        }
    }

    async saveData(tradesInfo) {
        const { exchange, symbol, sequelize } = this;

        const { Trade } = sequelize;


        try {
            const { marketId } = await this.getMarketInfo();

            await Trade.create({
                marketId,
                tradesInfo
            });

            logger(level).info('Data have saved successfully');
        } catch (error) {
            logger(level).error(`Trade did not save for ${exchange} and ${symbol} market`, error);
        }
    }
}
