import BaseCLIRunner from '../BaseCLIRunner.js';
// eslint-disable-next-line import/no-unresolved
import ccxt from 'ccxt';

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

    async processExchange({ exchange, rateLimit, ...collectorsOptions }) {
        const exchangeAPI = new ccxt[exchange.id]();
        const baseRateLimit =
            exchange.rateLimit ??
            collectorsOptions.exchangeAPI.rateLimit ??
            rateLimit;

        await exchangeAPI.loadMarkets();

        const symbolPromises = exchange.symbols.map((symbol, queuePosition) => {
            return this.runCollectors({
                exchange: exchange.id,
                symbol,
                rabbitGroupName: exchange.id,
                exchangeAPI,
                amqpClient: this.amqpClient,
                logger: this.logger,

                schedulerOptions: {
                    queuePosition,
                    queueSize: exchange.symbols.length,
                    baseRateLimit,
                    ...collectorsOptions,
                },
            });
        });

        await Promise.all(symbolPromises);
    }
}

export default CCXTCollectorsRunner;
