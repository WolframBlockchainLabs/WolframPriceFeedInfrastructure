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
        const exchangeAPI = new CCXTDriverWrapper({ exchangeId: exchange.id });
        const baseRateLimit =
            exchange.rateLimit ?? exchangeAPI.rateLimit ?? rateLimit;

        await exchangeAPI.loadMarkets();

        const symbolPromises = exchange.symbols.map((symbol, queuePosition) => {
            const collectorsScheduler = this.setupScheduler({
                exchange: exchange.id,
                logger: this.logger,
                symbol,
                queuePosition,
                queueSize: exchange.symbols.length,
                baseRateLimit,
                minimalCycleDuration: exchange.minimalCycleDuration,
                ...schedulerOptions,
            });

            const collectorsManager = this.setupCollectorsManager({
                exchange: exchange.id,
                symbol,
                rabbitGroupName: exchange.id,
                exchangeAPI,
                amqpClient: this.amqpClient,
                logger: this.logger,
                collectorsScheduler,
            });

            return collectorsManager.start();
        });

        await Promise.all(symbolPromises);
    }
}

export default CCXTCollectorsRunner;
