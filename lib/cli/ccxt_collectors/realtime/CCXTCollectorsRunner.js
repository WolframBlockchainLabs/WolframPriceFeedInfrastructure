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