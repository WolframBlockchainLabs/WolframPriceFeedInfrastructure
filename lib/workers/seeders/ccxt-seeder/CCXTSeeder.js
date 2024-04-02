import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import CCXTDriverWrapper from '#domain-collectors/integrations/ccxt/CCXTDriverWrapper.js';
import BaseWorker from '#workers/BaseWorker.js';

class CCXTSeeder extends BaseWorker {
    async execute(exchangeConfigs) {
        for (const exchangeConfig of exchangeConfigs) {
            try {
                const exchange = await this.createExchange(exchangeConfig);
                await this.loadMarkets(exchange, exchangeConfig.symbols);
            } catch (error) {
                this.logger.error(
                    `Error setting up [${exchangeConfig.name}] exchange: ${error.message}`,
                );
            }
        }
    }

    async createExchange(exchangeConfig) {
        try {
            this.logger.info(`Setting up [${exchangeConfig.name}] exchange`);
            const [exchange, created] = await Exchange.findOrCreate({
                where: { externalExchangeId: exchangeConfig.id },
                defaults: { name: exchangeConfig.name },
            });

            /* istanbul ignore next */
            this.logger.info(
                `${exchange.name} exchange has been ${
                    created ? 'created' : 'found'
                } successfully`,
            );
            return exchange;
        } catch (error) {
            this.logger.error(
                `Error creating exchange [${exchangeConfig.name}]: ${error.message}`,
            );
            throw error;
        }
    }

    async loadMarkets(exchange, symbols) {
        try {
            const exchangeAPI = new CCXTDriverWrapper({
                exchangeId: exchange.externalExchangeId,
            });
            const currentExchangeMarkets = await exchangeAPI.loadMarkets();
            this.logger.info(`Loading Markets for [${exchange.name}]`);

            for (const symbol of symbols) {
                await this.createMarket(
                    exchange,
                    currentExchangeMarkets,
                    symbol,
                );
            }

            this.logger.info(
                `All Markets for [${exchange.name}] have been loaded`,
            );
        } catch (error) {
            this.logger.error(
                `Error loading markets for [${exchange.name}]: ${error.message}`,
            );
        }
    }

    async createMarket(exchange, currentExchangeMarkets, symbol) {
        try {
            if (!currentExchangeMarkets[symbol]) {
                return this.logger.warning(
                    `Symbol ${symbol} not found for [${exchange.name}]`,
                );
            }

            const marketData = currentExchangeMarkets[symbol];
            const [, created] = await Market.findOrCreate({
                where: { symbol, exchangeId: exchange.id },
                defaults: {
                    externalMarketId: marketData.id,
                    base: marketData.base,
                    quote: marketData.quote,
                    baseId: marketData.baseId,
                    quoteId: marketData.quoteId,
                    active: marketData.active,
                },
            });

            /* istanbul ignore next */
            this.logger.info(
                `Market for [${exchange.name} & ${symbol}] has been ${
                    created ? 'created' : 'found'
                } successfully`,
            );
        } catch (error) {
            this.logger.error(
                `Error creating market [${symbol}] for exchange [${exchange.name}]: ${error.message}`,
            );
        }
    }
}

export default CCXTSeeder;
