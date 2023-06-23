import Exchange from '../domain-model/entities/Exchange.js';
import Market from '../domain-model/entities/Market.js';

class MarketService {
    constructor({ logger, exchangeAPI }) {
        this.logger = logger;
        this.exchangeAPI = exchangeAPI;
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
                : await this.createMarket({ exchange, exchangeId, symbol });

            return { marketId };
        } catch (error) {
            this.logger.error({
                message: `Failed to create Market for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async createMarket({ exchange, exchangeId, symbol }) {
        const currentExchange = await this.exchangeAPI.loadMarkets();

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

        this.logger.info(
            `Market for '${exchange} & ${symbol}' has been created`,
        );

        return market.id;
    }
}

export default MarketService;
