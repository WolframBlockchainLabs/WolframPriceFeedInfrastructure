import { logger } from '../infrastructure/logger/logger.js';
import Collector  from './Base.js';

const level = 'collector';

export class TradeCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol } = this;

        await exchangeAPI.loadMarkets();

        // eslint-disable-next-line no-magic-numbers
        const sinceTime = exchangeAPI.milliseconds() - 60000;

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

    async saveData(tradesInfo, marketId) {
        const { exchange, symbol, sequelize: { Trade } } = this;

        try {
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
