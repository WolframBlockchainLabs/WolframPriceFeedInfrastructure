import Market from '#domain-model/entities/Market.js';
import BaseCryptoConfigSeeder from '../BaseCryptoConfigSeeder.js';

class UDEXSeeder extends BaseCryptoConfigSeeder {
    async execute(udexCollectorsConfig) {
        for (const groupConfig of Object.values(udexCollectorsConfig)) {
            await this.setupGroup(groupConfig);
        }
    }

    async setupGroup(groupConfig) {
        const groupName = groupConfig.groupName;
        this.logger.info(`Setting up [${groupName}] group`);

        for (const exchangeConfig of groupConfig.exchanges) {
            await this.setupExchange({ groupName, exchangeConfig });
        }
    }

    async updateOrCreateMarket({ symbol, exchange, pair }) {
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
                baseId: pair.in.name,
                baseMeta: pair.in.meta,

                quote: pair.out.symbol,
                quoteId: pair.out.name,
                quoteMeta: pair.out.meta,
            },
        );
    }
}

export default UDEXSeeder;
