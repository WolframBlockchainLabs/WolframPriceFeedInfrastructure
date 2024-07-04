import Market from '#domain-model/entities/Market.js';
import dumpMarket from '#use-cases/utils/dumps/dumpMarket.js';
import BaseFactory from './BaseFactory.js';

class MarketFactory extends BaseFactory {
    static MARKETS = [
        {
            externalMarketId: 'BTCEUR',
            symbol: 'BTC/EUR',
            base: 'BTC',
            quote: 'EUR',
            baseId: 'BTC',
            quoteId: 'EUR',
            active: true,
        },
        {
            externalMarketId: 'BTCUSDT',
            symbol: 'BTC/USDT',
            base: 'BTC',
            quote: 'USDT',
            baseId: 'BTC',
            quoteId: 'USDT',
            active: true,
        },
        {
            externalMarketId: 'ETHUSDT',
            symbol: 'ETH/USDT',
            base: 'ETH',
            quote: 'USDT',
            baseId: 'ETH',
            quoteId: 'USDT',
            active: false,
        },
        {
            externalMarketId: 'ETHEUR',
            symbol: 'ETH/EUR',
            base: 'ETH',
            quote: 'EUR',
            baseId: 'ETH',
            quoteId: 'EUR',
            active: false,
        },
    ];

    async create(exchanges = []) {
        const marketPromises = exchanges.flatMap((exchange) => {
            return MarketFactory.MARKETS.map((props) =>
                Market.create({
                    ...props,
                    exchangeId: exchange.id,
                }),
            );
        });

        const markets = await Promise.all(marketPromises);

        return markets.map((market) => {
            return dumpMarket(market);
        });
    }
}

export default MarketFactory;
