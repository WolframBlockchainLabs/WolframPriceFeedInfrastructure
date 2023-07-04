import BaseWorker from '../BaseWorker.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Market from '../../domain-model/entities/Market.js';
// eslint-disable-next-line import/no-unresolved
import ccxt from 'ccxt';

class MarketsRefresher extends BaseWorker {
    async execute(exchangeConfigs) {
        for (const exchangeConfigKey in exchangeConfigs) {
            const exchangeConfig = exchangeConfigs[exchangeConfigKey];

            this.logger.info(`Refreshing [${exchangeConfig.name}] exchange`);

            const exchange = await Exchange.findOne({
                where: {
                    externalExchangeId: exchangeConfig.id,
                    name: exchangeConfig.name,
                },
            });

            if (!exchange) {
                this.logger.warn(`Could not find ${exchange.name} exchange`);
            }

            await this.refreshMarkets(exchange, exchangeConfig.symbols);
        }
    }

    async refreshMarkets(exchange, symbols) {
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

            const market = await Market.findOne({
                where: {
                    symbol,
                    exchangeId: exchange.id,
                },
            });

            if (!market) {
                this.logger.warn(
                    `Could not find Market for [${exchange.name} & ${market.symbol}]`,
                );
            } else {
                await market.update({
                    externalMarketId,
                    base,
                    quote,
                    baseId,
                    quoteId,
                    active,
                });

                this.logger.info(
                    `Market for [${exchange.name} & ${market.symbol}] has been refreshed successfully`,
                );
            }
        }

        this.logger.info(
            `All Markets for [${exchange.name}] have been updated`,
        );
    }
}

export default MarketsRefresher;
