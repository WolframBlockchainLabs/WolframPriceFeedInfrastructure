import CollectorsManager from '../../../domain-collectors/CollectorsManager.js';
import BaseCLIRunner from '../../BaseCLIRunner.js';
import CandleStickCollector from '../../../domain-collectors/collectors/CandleStickCollector.js';
import OrderBookCollector from '../../../domain-collectors/collectors/OrderBookCollector.js';
import TickerCollector from '../../../domain-collectors/collectors/TickerCollector.js';
import TradeCollector from '../../../domain-collectors/collectors/TradeCollector.js';
// eslint-disable-next-line import/no-unresolved
import ccxt from 'ccxt';
import './options_schema.js';

class CCXTCollectorsRunner extends BaseCLIRunner {
    optionsValidationRules = {
        exchanges: ['required', 'string', 'json'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        replicaSize: ['required', 'positive_integer'],
        instancePosition: ['required', 'integer'],
    };

    async process({ options: { exchanges, rateLimit, ...collectorsOptions } }) {
        for (const exchange of exchanges) {
            const exchangeAPI = new ccxt[exchange.id]();

            await exchangeAPI.loadMarkets();

            for (let i = 0; i < exchange.symbols.length; i++) {
                await this.runCollectors({
                    exchangeAPI,
                    exchange: exchange.id,
                    symbol: exchange.symbols[i],
                    queuePosition: i,
                    queueSize: exchange.symbols.length,
                    defaultRateLimit: rateLimit,
                    enforcedRateLimit: exchange.rateLimit,
                    logger: this.logger,
                    amqpClient: this.amqpClient,
                    ...collectorsOptions,
                });
            }
        }
    }

    async runCollectors({
        enforcedRateLimit,
        defaultRateLimit,
        ...collectorsOptions
    }) {
        const rateLimit =
            enforcedRateLimit ??
            collectorsOptions.exchangeAPI.rateLimit ??
            defaultRateLimit;

        const collectorsManager = new CollectorsManager({
            models: [
                CandleStickCollector,
                OrderBookCollector,
                TickerCollector,
                TradeCollector,
            ],
            rateLimit,
            ...collectorsOptions,
        });

        await collectorsManager.start();
    }
}

export default CCXTCollectorsRunner;
