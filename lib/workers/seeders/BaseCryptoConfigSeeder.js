import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import BaseWorker from '#workers/BaseWorker.js';

class BaseCryptoConfigSeeder extends BaseWorker {
    async setupExchange({ groupName, exchangeConfig }) {
        try {
            this.logger.info(
                `Setting up [${groupName}/${exchangeConfig.name}] exchange`,
            );

            const [exchange, created] = await Exchange.findOrCreate({
                where: { externalExchangeId: exchangeConfig.id },
                defaults: {
                    name: exchangeConfig.name,
                    dataSource: groupName,
                },
            });

            this.logger.info(
                `${groupName}/${exchange.name} exchange has been ${
                    created ? 'created' : 'found'
                } successfully`,
            );

            await this.setupMarkets({
                groupName,
                exchange,
                markets: exchangeConfig.markets,
            });
        } catch (error) {
            this.logger.error({
                message: `Error setting up exchange [${groupName}/${exchangeConfig.name}]`,
                error,
            });
        }
    }

    async setupMarkets({ groupName, exchange, markets }) {
        this.logger.info(`Loading Markets for [${groupName}/${exchange.name}]`);

        await this.resetMarketStatuses(exchange);

        for (const marketConfig of markets) {
            await this.seedMarket({
                groupName,
                exchange,
                marketConfig,
            });
        }

        this.logger.info(
            `All Markets for [${groupName}/${exchange.name}] have been loaded`,
        );
    }

    async seedMarket({ groupName, exchange, marketConfig }) {
        const { pair, symbol } = marketConfig;

        try {
            const [storedMarket, created] = await Market.upsert(
                {
                    symbol,
                    exchangeId: exchange.id,
                    externalMarketId: symbol,
                    meta: pair.meta,
                    active: true,

                    base: pair.in.symbol,
                    baseId: pair.in.name,
                    baseMeta: pair.in.meta,

                    quote: pair.out.symbol,
                    quoteId: pair.out.name,
                    quoteMeta: pair.out.meta,
                },
                {
                    where: {
                        externalMarketId: symbol,
                        exchangeId: exchange.id,
                    },
                },
            );

            this.logger.info(
                `Market for [${groupName}/${exchange.name} :: ${
                    storedMarket.externalMarketId
                }] has been ${created ? 'created' : 'found'} successfully`,
            );

            return storedMarket;
        } catch (error) {
            this.logger.error({
                message: `Error creating market [${groupName}/${exchange.name} :: ${symbol}]`,
                error,
            });
        }
    }

    async resetMarketStatuses(exchange) {
        await Market.update(
            { active: false },
            {
                where: {
                    exchangeId: exchange.id,
                },
            },
        );
    }
}

export default BaseCryptoConfigSeeder;
