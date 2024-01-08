import MarketsManager from '#domain-collectors/MarketsManager.js';
import CCXTDriverWrapper from '#domain-collectors/integrations/ccxt/CCXTDriverWrapper.js';
import BaseCLIRunner from '../BaseCLIRunner.js';

class CCXTCollectorsRunner extends BaseCLIRunner {
    async process({ options: { exchanges, ...collectorsOptions } }) {
        const exchangePromises = exchanges.map((exchange) => {
            return this.processExchange({
                exchange,
                ...collectorsOptions,
            });
        });

        await Promise.all(exchangePromises);
    }

    async processExchange({ exchange, rateLimit, ...schedulerOptions }) {
        const exchangeAPI = await this.initExchangeAPI(exchange.id);

        const marketsManager = this.initMarketsManager({
            exchange,
            rateLimit,
            exchangeAPI,
            schedulerOptions,
        });

        return marketsManager.start();
    }

    async initExchangeAPI(exchangeId) {
        const exchangeAPI = new CCXTDriverWrapper({ exchangeId });

        await exchangeAPI.loadMarkets();

        return exchangeAPI;
    }

    initMarketsManager({ exchange, rateLimit, exchangeAPI, schedulerOptions }) {
        const baseRateLimit =
            exchange.rateLimit ?? exchangeAPI.rateLimit ?? rateLimit;

        const schedulersFactory = this.setupSchedulersFactory({
            exchange: exchange.id,
            logger: this.logger,
            baseRateLimit,
            minimalCycleDuration: exchange.minimalCycleDuration,
            ...schedulerOptions,
        });

        const collectorsManagersFactory = this.setupCollectorsManagersFactory({
            exchange: exchange.id,
            rabbitGroupName: exchange.id,
            exchangeAPI,
            amqpClient: this.amqpClient,
            logger: this.logger,
        });

        return new MarketsManager({
            markets: exchange.symbols.map((symbol) => ({ symbol })),
            logger: this.logger,
            amqpClient: this.amqpClient,
            rabbitGroupName: exchange.id,
            schedulersFactory,
            collectorsManagersFactory,
        });
    }
}

export default CCXTCollectorsRunner;
