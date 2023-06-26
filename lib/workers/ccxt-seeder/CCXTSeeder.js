import BaseWorker from '../BaseWorker.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Market from '../../domain-model/entities/Market.js';
import ccxt from 'ccxt';

class CCXTSeeder extends BaseWorker {
    async execute(exchangeConfigs) {
        for (const exchangeConfigKey in exchangeConfigs) {
            const exchangeConfig = exchangeConfigs[exchangeConfigKey];
            this.logger.info(`Creating '${exchangeConfig.name} exchange`);

            const exchange = await Exchange.create({
                externalExchangeId: exchangeConfig.id,
                name: exchangeConfig.name,
            });

            await this.loadMarkets(exchange, exchangeConfig.symbols);

            this.logger.info(
                `'${exchange.name} exchange and its markets have been created successfully`,
            );
        }
    }

    async loadMarkets(exchange, symbols) {
        const exchangeAPI = new ccxt[exchange.externalExchangeId]();
        const currentExchangeMarkets = await exchangeAPI.loadMarkets();

        this.logger.info(`Loading Markets for '${exchange.name}`);

        for (const symbol of symbols) {
            const {
                id: externalMarketId,
                base,
                quote,
                baseId,
                quoteId,
                active,
            } = currentExchangeMarkets[symbol];

            await Market.create({
                externalMarketId,
                symbol,
                base,
                quote,
                baseId,
                quoteId,
                active,
                exchangeId: exchange.id,
            });

            this.logger.info(
                `Market for '${exchange.name} & ${symbol}' has been created`,
            );
        }

        this.logger.info(`All Markets for '${exchange.name} has been loaded`);
    }
}

export default CCXTSeeder;
