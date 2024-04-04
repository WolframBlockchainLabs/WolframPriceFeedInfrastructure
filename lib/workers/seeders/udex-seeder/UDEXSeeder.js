import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import BaseWorker from '#workers/BaseWorker.js';

class UDEXSeeder extends BaseWorker {
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

    async setupExchange({ groupName, exchangeConfig }) {
        try {
            this.logger.info(
                `Setting up [${groupName}/${exchangeConfig.name}] exchange`,
            );

            const [exchange, created] = await Exchange.findOrCreate({
                where: { externalExchangeId: exchangeConfig.id },
                defaults: { name: exchangeConfig.name },
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
            this.logger.error(
                `Error setting up exchange [${groupName}/${exchangeConfig.name}]: ${error}`,
            );
        }
    }

    async setupMarkets({ groupName, exchange, markets }) {
        this.logger.info(`Loading Markets for [${groupName}/${exchange.name}]`);

        for (const marketConfig of markets) {
            await this.createMarket({ groupName, exchange, marketConfig });
        }

        this.logger.info(
            `All Markets for [${groupName}/${exchange.name}] have been loaded`,
        );
    }

    async createMarket({ groupName, exchange, marketConfig }) {
        const { pair, symbol } = marketConfig;
        const [baseId, quoteId] = symbol.split('/');

        try {
            const [storedMarket, created] = await Market.findOrCreate({
                where: { symbol, exchangeId: exchange.id },
                defaults: {
                    externalMarketId: symbol,
                    base: pair.in.name,
                    quote: pair.out.name,
                    baseId,
                    quoteId,
                },
            });

            this.logger.info(
                `Market for [${groupName}/${exchange.name} :: ${
                    storedMarket.symbol
                }] has been ${created ? 'created' : 'found'} successfully`,
            );
        } catch (error) {
            this.logger.error(
                `Error creating market [${groupName}/${exchange.name} :: ${symbol}]: ${error}`,
            );
        }
    }
}

export default UDEXSeeder;
