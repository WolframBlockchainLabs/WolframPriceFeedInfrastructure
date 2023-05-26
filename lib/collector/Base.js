// eslint-disable-next-line import/no-unresolved
import ccxt       from 'ccxt';
import { logger } from '../infrastructure/logger/logger.js';


const level = 'collector';

export default class Collector {
    constructor({ exchange, market }, dbConfig, interval, sequelize) {
        this.exchange = exchange;
        this.market = market;
        this.dbConfig = dbConfig;
        this.sequelize = sequelize;
        this.interval = interval;
        this.intervalId = null;
    }

    start() {
        const { exchange, market, interval } = this;

        this.intervalId = setInterval(() => {
            logger(level).info(`Collector for '${exchange}' ${market} orderBook is running`);

            const data = this.fetch();


            this.save(data);
        }, interval);
    }

    async fetch() {
        const { exchange, market } = this;

        const exchangeIndex = ccxt.exchanges.indexOf(exchange);

        const exchangeInfo = new ccxt[ccxt.exchanges[exchangeIndex]]();

        this.fetchData(exchangeInfo, market);
    }

    async save(data) {
        const { exchange, sequelize } = this;

        const { Exchange, Market } = sequelize;

        const { symbol } = data;

        const { id: exchangeId } = await Exchange.findOne({
            where : { externalExchangeId: exchange }
        });

        const { id: marketId } = await Market.findOne({
            where : { exchangeId, symbol }
        });


        this.saveData(data, marketId);
    }

    stopInterval() {
        const { interval } = this;

        clearInterval(interval);
        this.intervalId = null;
    }
}
