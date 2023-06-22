import ccxt from 'ccxt';
import Exchange from '../domain-model/Exchange.js';
import Market from '../domain-model/Market.js';

export class MarketService {
    constructor(logger) {
        this.logger = logger;
    }

    async getMarketInfo(exchange, symbol) {
        const { id: exchangeId } = await Exchange.findOne({
            where: { externalExchangeId: exchange },
        });

        try {
            const market = await Market.findOne({
                where: { exchangeId, symbol },
            });

            const marketId = market
                ? market.id
                : await this.createMarket(exchange, exchangeId, symbol);

            return { marketId };
        } catch (error) {
            this.logger.error(`Market ${symbol} did not create`, error.message);
        }
    }

    async createMarket(exchange, exchangeId, symbol) {
        const exchangeAPI = new ccxt[exchange]();

        const currentExchange = await exchangeAPI.loadMarkets();

        const {
            id: externalMarketId,
            base,
            quote,
            baseId,
            quoteId,
            active,
        } = currentExchange[symbol];

        const market = await Market.create({
            externalMarketId,
            symbol,
            base,
            quote,
            baseId,
            quoteId,
            active,
            exchangeId,
        });

        this.logger.info(`Market ${symbol} create`);

        return market.id;
    }
}
