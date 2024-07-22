import ccxtCollectorsConfig from '#configs/ccxtCollectorsConfig.cjs';
import CCXTDriverWrapper from '#domain-collectors/integrations/ccxt/driver/CCXTDriverWrapper.js';
import BaseCollectorsRunner from '../BaseCollectorsRunner.js';

class CCXTCollectorsRunner extends BaseCollectorsRunner {
    async process({ options: { exchangeIds, ...extendedConfig } }) {
        const { exchanges, ...collectorsOptions } = this.resolveConfig({
            exchangeIds,
            extendedConfig,
        });

        this.logger.info({
            message: 'Initializing CCXT collectors',
            exchangeIds,
            modifier: this.getIdentityModifier(),
        });

        const exchangePromises = exchanges.map((exchange) => {
            return this.processExchange({
                exchange,
                ...collectorsOptions,
            });
        });

        await Promise.all(exchangePromises);
    }

    async processExchange({ exchange, rateLimit, ...schedulerOptions }) {
        const marketsManagerFactory = await this.getMarketsManagerFactory({
            exchange,
            rateLimit,
            schedulerOptions,
        });

        await this.initMarketsAMQPManager({
            marketsManagerFactory,
            logger: this.logger,
            amqpClient: this.amqpClient,
            externalExchangeId: exchange.id,
            policiesConfigs: this.config.policiesConfigs,
        });
    }

    async initExchangeAPI({ id, ...options }) {
        const exchangeAPI = new CCXTDriverWrapper({
            exchangeId: id,
            ...options,
        });

        await exchangeAPI.loadMarkets();

        return exchangeAPI;
    }

    async getMarketsManagerFactory({ exchange, rateLimit, schedulerOptions }) {
        const exchangeAPI = await this.initExchangeAPI(exchange);
        const baseRateLimit =
            exchange.rateLimit ?? exchangeAPI.rateLimit ?? rateLimit;

        const schedulersFactory = this.setupSchedulersFactory({
            baseRateLimit,
            ...schedulerOptions,
        });

        const collectorsManagersFactory = this.setupCollectorsManagersFactory({
            exchangeAPI,
        });

        return this.setupMarketsManagerFactory({
            schedulersFactory,
            collectorsManagersFactory,
        });
    }

    resolveConfig({ exchangeIds, extendedConfig }) {
        const groupConfig = ccxtCollectorsConfig[this.GROUP_NAME];
        const exchangeIdsSet = new Set(exchangeIds);

        return {
            ...groupConfig,
            ...extendedConfig,
            exchanges: groupConfig.exchanges.filter((exchange) =>
                exchangeIdsSet.has(exchange.id),
            ),
        };
    }
}

export default CCXTCollectorsRunner;
