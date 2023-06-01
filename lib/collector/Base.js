// eslint-disable-next-line import/no-unresolved
import ccxt       from 'ccxt';
import { logger } from '../infrastructure/logger/logger.js';

const level = 'collector';

export default class Collector {
    constructor({ exchange, symbol }, interval, sequelize, marketId) {
        this.exchange = exchange;
        this.symbol = symbol;
        this.sequelize = sequelize;
        this.interval = interval;
        this.intervalId = null;
        this.marketId = marketId;
        this.exchangeAPI = new ccxt[exchange]();
    }

    start() {
        const { exchange, symbol, interval, marketId } = this;

        this.intervalId = setInterval(async () => {
            logger(level).info(`Collector for '${exchange}' ${symbol} orderBook is running`);
            try {
                const data = await this.fetchData();

                await this.saveData(data, marketId);
            } catch (error) {
                logger(level).error('Collector has finished with error', error);
            }
        }, interval);
    }


    stop() {
        const { intervalId } = this;

        clearInterval(intervalId);
        this.intervalId = null;
    }
}
