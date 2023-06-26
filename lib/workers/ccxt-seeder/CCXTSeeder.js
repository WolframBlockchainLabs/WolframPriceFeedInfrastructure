import BaseWorker from '../BaseWorker.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Market from '../../domain-model/entities/Market.js';
import ccxt from 'ccxt';

class CCXTSeeder extends BaseWorker {
    async execute(exchangeConfigs) {
        for (const exchangeConfigKey in exchangeConfigs) {
            const exchangeConfig = exchangeConfigs[exchangeConfigKey];

            this.logger.info(`Setting up [${exchangeConfig.name}] exchange`);

            const [exchange, created] = await Exchange.findOrCreate({
                where: {
                    externalExchangeId: exchangeConfig.id,
                    name: exchangeConfig.name,
                },
            });

            this.logger.info(
                `${exchange.name} exchange has been ${
                    created ? 'created' : 'found'
                } successfully`,
            );

            await this.loadMarkets(exchange, exchangeConfig.symbols);
        }
    }

    async loadMarkets(exchange, symbols) {
        const exchangeAPI = new ccxt[exchange.externalExchangeId]();
        const currentExchangeMarkets = await exchangeAPI.loadMarkets();

        this.logger.info(`Loading Markets for [${exchange.name}]`);

        for (const symbol of symbols) {
            const {
                id: externalMarketId,
                base,
                quote,
                baseId,
                quoteId,
                active,
            } = currentExchangeMarkets[symbol];

            const [market, created] = await Market.findOrCreate({
                where: {
                    externalMarketId,
                    symbol,
                    exchangeId: exchange.id,
                },
                defaults: {
                    base,
                    quote,
                    baseId,
                    quoteId,
                    active,
                },
            });

            this.logger.info(
                `Market for [${exchange.name} & ${market.symbol}] has been ${
                    created ? 'created' : 'found'
                } successfully`,
            );
        }

        this.logger.info(`All Markets for [${exchange.name}] have been loaded`);
    }
}

export default CCXTSeeder;
