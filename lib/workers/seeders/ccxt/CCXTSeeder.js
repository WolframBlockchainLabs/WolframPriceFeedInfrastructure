import CCXTDriverWrapper from '#domain-collectors/integrations/ccxt/driver/CCXTDriverWrapper.js';
import Exchange from '#domain-model/entities/Exchange.js';
import BaseWorker from '#workers/BaseWorker.js';

class CCXTSeeder extends BaseWorker {
    async execute(exchangeConfigs) {
        for (const exchangeConfig of exchangeConfigs) {
            try {
                this.logger.info(
                    `Setting up [${exchangeConfig.name}] exchange`,
                );

                const exchange = await this.setupExchange(exchangeConfig);

                this.logger.info(`Loading Markets for [${exchange.name}]`);

                await this.loadMarkets(exchange, exchangeConfig.symbols);

                this.logger.info(
                    `All Markets for [${exchange.name}] have been loaded`,
                );
            } catch (error) {
                this.logger.error({
                    message: `Error setting up [${exchangeConfig.name}] exchange`,
                    error,
                });
            }
        }
    }

    async setupExchange(exchangeConfig) {
        const [exchange, created] = await Exchange.updateOrCreate(
            {
                externalExchangeId: exchangeConfig.id,
            },
            {
                name: exchangeConfig.name,
                dataSource: exchangeConfig.id,
            },
        );

        this.logger.info(
            `${exchange.name} exchange has been ${
                created ? 'created' : 'updated'
            } successfully`,
        );

        return exchange;
    }

    async loadMarkets(exchange, symbols) {
        await this.resetMarketStatuses(exchange.id);

        const exchangeAPI = new CCXTDriverWrapper({
            exchangeId: exchange.externalExchangeId,
        });
        const currentExchangeMarkets = await exchangeAPI.loadMarkets();

        for (const symbol of symbols) {
            await this.setupMarket(exchange, currentExchangeMarkets, symbol);
        }
    }

    async resetMarketStatuses() {
        throw new Error(
            `[${this.constructor.name}]: resetMarketStatuses method is not implemented`,
        );
    }

    async setupMarket(exchange, currentExchangeMarkets, symbol) {
        try {
            if (!currentExchangeMarkets[symbol]) {
                return this.logger.warning(
                    `Symbol ${symbol} not found for [${exchange.name}]`,
                );
            }

            const marketData = currentExchangeMarkets[symbol];

            const created = await this.updateOrCreateMarket({
                symbol,
                exchangeId: exchange.id,
                externalMarketId: marketData.id,
                base: marketData.base,
                quote: marketData.quote,
                baseId: marketData.baseId,
                quoteId: marketData.quoteId,
            });

            this.logger.info(
                `Market for [${exchange.name} & ${symbol}] has been ${
                    created ? 'created' : 'updated'
                } successfully`,
            );
        } catch (error) {
            this.logger.error(
                `Error creating market [${symbol}] for exchange [${exchange.name}]: ${error.message}`,
            );
        }
    }

    async updateOrCreateMarket() {
        throw new Error(
            `[${this.constructor.name}]: updateOrCreateMarket method is not implemented`,
        );
    }
}

export default CCXTSeeder;
