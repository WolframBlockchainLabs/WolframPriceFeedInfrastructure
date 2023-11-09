import BaseCLIRunner from '../BaseCLIRunner.js';
// eslint-disable-next-line import/no-unresolved
import ccxt from 'ccxt';

class CCXTCollectorsRunner extends BaseCLIRunner {
    async process({ options: { exchanges, rateLimit, ...collectorsOptions } }) {
        const exchangePromises = exchanges.map((exchange) => {
            return this.processExchange({
                exchange,
                rateLimit,
                collectorsOptions,
            });
        });

        await Promise.all(exchangePromises);
    }

    async processExchange({ exchange, rateLimit, collectorsOptions }) {
        const exchangeAPI = new ccxt[exchange.id]();
        const baseRateLimit =
            exchange.rateLimit ??
            collectorsOptions.exchangeAPI.rateLimit ??
            rateLimit;

        await exchangeAPI.loadMarkets();

        const symbolPromises = exchange.symbols.map((symbol, queuePosition) => {
            return this.runCollectors({
                exchangeAPI,
                exchange: exchange.id,
                symbol,
                queuePosition,
                queueSize: exchange.symbols.length,
                baseRateLimit,
                logger: this.logger,
                amqpClient: this.amqpClient,
                ...collectorsOptions,
            });
        });

        await Promise.all(symbolPromises);
    }
}

export default CCXTCollectorsRunner;
