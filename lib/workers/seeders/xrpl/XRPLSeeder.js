import Market from '#domain-model/entities/Market.js';
import BaseCryptoConfigSeeder from '../BaseCryptoConfigSeeder.js';

class XRPLSeeder extends BaseCryptoConfigSeeder {
    async execute({ exchange, markets }) {
        return this.setupExchange({
            groupName: exchange.id,
            exchangeConfig: { ...exchange, markets },
        });
    }

    async updateOrCreateMarket({ symbol, exchange, pair }) {
        const [baseId, quoteId] = symbol.split('/');

        return Market.updateOrCreate(
            {
                externalMarketId: symbol,
                exchangeId: exchange.id,
            },
            {
                symbol,
                meta: pair.meta,
                active: true,

                base: pair.in.symbol,
                baseId,
                baseMeta: pair.in.meta,

                quote: pair.out.symbol,
                quoteId,
                quoteMeta: pair.out.meta,
            },
        );
    }
}

export default XRPLSeeder;
