import BaseWorker from '../BaseWorker.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Market from '../../domain-model/entities/Market.js';
import CCXTDriverWrapper from '../../domain-collectors/integrations/ccxt/CCXTDriverWrapper.js';

class MarketsRefresher extends BaseWorker {
    async execute(exchangeConfigs) {
        for (const exchangeConfig of exchangeConfigs) {
            try {
                await this.refreshExchange(exchangeConfig);
            } catch (error) {
                this.logger.error(
                    `Error refreshing [${exchangeConfig.name}] exchange: ${error.message}`,
                );
            }
        }
    }

    async refreshExchange(exchangeConfig) {
        this.logger.info(`Refreshing [${exchangeConfig.name}] exchange`);

        const exchange = await Exchange.findOne({
            where: {
                externalExchangeId: exchangeConfig.id,
                name: exchangeConfig.name,
            },
        });

        if (!exchange) {
            return this.logger.warning(
                `Could not find ${exchangeConfig.name} exchange`,
            );
        }

        await this.refreshMarkets(exchange, exchangeConfig.symbols);
    }

    async refreshMarkets(exchange, symbols) {
        try {
            const exchangeAPI = new CCXTDriverWrapper({
                exchangeId: exchange.externalExchangeId,
            });
            const currentExchangeMarkets = await exchangeAPI.loadMarkets();

            this.logger.info(`Loading Markets for [${exchange.name}]`);

            await Promise.all(
                symbols.map((symbol) =>
                    this.updateMarket(exchange, currentExchangeMarkets, symbol),
                ),
            );

            this.logger.info(
                `All Markets for [${exchange.name}] have been updated`,
            );
        } catch (error) {
            this.logger.error(
                `Error loading markets for [${exchange.name}]: ${error.message}`,
            );
        }
    }

    async updateMarket(exchange, currentExchangeMarkets, symbol) {
        const marketData = currentExchangeMarkets[symbol];

        if (!marketData) {
            return this.logger.warning(
                `Could not find Market for [${exchange.name} & ${symbol}]`,
            );
        }

        try {
            const market = await Market.findOne({
                where: {
                    symbol,
                    exchangeId: exchange.id,
                },
            });

            if (!market) {
                return this.logger.warning(
                    `Could not find Market for [${exchange.name} & ${symbol}]`,
                );
            }

            await market.update({
                externalMarketId: marketData.id,
                base: marketData.base,
                quote: marketData.quote,
                baseId: marketData.baseId,
                quoteId: marketData.quoteId,
                active: marketData.active,
            });

            this.logger.info(
                `Market for [${exchange.name} & ${market.symbol}] has been refreshed successfully`,
            );
        } catch (error) {
            this.logger.error(
                `Error updating market [${exchange.name} & ${symbol}]: ${error.message}`,
            );
        }
    }
}

export default MarketsRefresher;
