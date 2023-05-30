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

        this.intervalId = setInterval(async () => {
            logger(level).info(`Collector for '${exchange}' ${symbol} orderBook is running`);

            try {
                const data = await this.fetchData();

                await this.saveData(data);
            } catch (error) {
                logger(level).error('Collector has finished with error', error);
            }
        }, interval);
    }


    async getMarketInfo() {
        const { exchange, symbol, sequelize, exchangeAPI } = this;

        const { Exchange, Market } = sequelize;

        const { id: exchangeId } = await Exchange.findOne({
            where : { externalExchangeId: exchange }
        });

        let marketId;

        try {
            const market = await Market.findOne({
                where : { exchangeId, symbol }
            });


            if (market) {
                marketId = market.id;
            }


            if (!market) {
                const currentExchange = await exchangeAPI.loadMarkets();

                const { id:externalMarketId, base, quote, baseId, quoteId, active } = currentExchange[symbol];

                await Market.create({ externalMarketId,
                    symbol,
                    base,
                    quote,
                    baseId,
                    quoteId,
                    active,
                    exchangeId });

                logger(level).info(`Market ${symbol} create`);

                const newMarket = await Market.findOne({
                    where : { exchangeId, symbol }
                });

                marketId = newMarket.id;

                return marketId;
            }

            return { exchangeId, marketId };
        } catch (error) {
            logger(level).error(`Market ${symbol} did not create`, error);
        }
    }

    stop() {
        const { intervalId } = this;

        clearInterval(intervalId);
        this.intervalId = null;
    }
}
