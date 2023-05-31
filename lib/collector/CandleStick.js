import { logger } from '../infrastructure/logger/logger.js';
import Collector  from './Base.js';

const level = 'collector';

export class CandleStickCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol } = this;


        // eslint-disable-next-line no-magic-numbers
        const fromTimestamp = exchangeAPI.milliseconds() - 86400 * 100; // last 24 hrs

        console.log('fromTimestamp', fromTimestamp);


        try {
            await exchangeAPI.loadMarkets();

            return await exchangeAPI.fetchOHLCV(symbol, '1m', fromTimestamp);
        } catch (error) {
            logger(level).error(`Candle stick did not receive from ${exchangeAPI.name} for ${symbol} market`, error);
        }
    }

    async saveData(charts) {
        const { exchange, symbol, sequelize } = this;

        const { CandleStick } = sequelize;

        try {
            const { marketId } = await this.getMarketInfo();

            await CandleStick.create({
                marketId,
                charts
            });
            logger(level).info('Data have saved successfully');
        } catch (error) {
            logger(level).error(`CandleStick did not save for ${exchange} and ${symbol} market`, error);
        }
    }
}
