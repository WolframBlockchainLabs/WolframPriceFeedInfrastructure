// eslint-disable-next-line import/no-unresolved
import ccxt       from 'ccxt';
import { logger } from '../infrastructure/logger/logger.js';


const level = 'collector';

export default class Collector {
    constructor({ exchange, symbol }, interval, sequelize) {
        this.exchange = exchange;
        this.symbol = symbol;
        this.sequelize = sequelize;
        this.interval = interval;
        this.intervalId = null;
        this.exchangeAPI = new ccxt[exchange]();
        this.getMarketInfo();
    }

    start() {
        const { exchange, symbol, interval } = this;

        this.intervalId = setInterval( async () => {
            logger(level).info(`Collector for '${exchange}' ${symbol} orderBook is running`);

const data = await this.fetchData();
await this.saveData(data);
        }, interval);
    }


    async getMarketInfo() {
        const { exchange, symbol, sequelize } = this;

        const { Exchange, Market } = sequelize;

        //add create Market if is no market in db;
        
        const { id: exchangeId } = await Exchange.findOne({
            where : { externalExchangeId: exchange }
        });       
        
        const { id: marketId } = await Market.findOne({
            where : { exchangeId, symbol }
        });
        
        
        return { exchangeId, marketId };
    }

    stopInterval() {
        const { interval } = this;

        clearInterval(interval);
        this.intervalId = null;
    }
}
