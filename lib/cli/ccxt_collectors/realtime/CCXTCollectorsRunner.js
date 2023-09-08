import CollectorsManager from '../../../collectors/CollectorsManager.js';
import BaseCLIRunner from '../../BaseCLIRunner.js';
import CandleStickCollector from '../../../collectors/models/CandleStick.js';
import OrderBookCollector from '../../../collectors/models/OrderBook.js';
import TickerCollector from '../../../collectors/models/Ticker.js';
import TradeCollector from '../../../collectors/models/Trade.js';
// eslint-disable-next-line import/no-unresolved
import ccxt from 'ccxt';
import './options_schema.js';

class CCXTCollectorsRunner extends BaseCLIRunner {
    optionsValidationRules = {
        exchanges: ['required', 'string'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        replicaSize: ['required', 'positive_integer'],
        instancePosition: ['required', 'integer'],
    };

    async process({ options: { exchanges, rateLimit, ...collectorsOptions } }) {
        const parsedExchanges = JSON.parse(exchanges.slice(1, -1));

        for (const exchange of parsedExchanges) {
            for (let i = 0; i < exchange.symbols.length; i++) {
                await this.runCollectors({
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
        const exchangeAPI = new ccxt[collectorsOptions.exchange]();
        const rateLimit =
            enforcedRateLimit ?? exchangeAPI.rateLimit ?? defaultRateLimit;

        const collectorsManager = new CollectorsManager({
            models: [
                CandleStickCollector,
                OrderBookCollector,
                TickerCollector,
                TradeCollector,
            ],
            exchangeAPI,
            rateLimit,
            ...collectorsOptions,
        });

        await collectorsManager.start();
    }
}

export default CCXTCollectorsRunner;
