import BaseCLIRunner from '../../BaseCLIRunner.js';
import HistoricalManager from '../../../collectors/HistoricalManager.js';
import CandleStickCollector from '../../../collectors/models/CandleStick.js';
import TradeCollector from '../../../collectors/models/Trade.js';
// eslint-disable-next-line import/no-unresolved
import ccxt from 'ccxt';
import './options_schema.js';

class CCXTHistoricalCollectorsRunner extends BaseCLIRunner {
    optionsValidationRules = {
        exchanges: ['required', 'string', 'json'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        scheduleStartDate: ['required', 'string'],
        scheduleEndDate: ['required', 'string'],
    };

    async process({ options: { exchanges, rateLimit, ...collectorsOptions } }) {
        const collectorPromises = [];

        for (const exchange of exchanges) {
            for (let i = 0; i < exchange.symbols.length; i++) {
                const runCollectorsPromise = this.runCollectors({
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

                collectorPromises.push(runCollectorsPromise);
            }
        }

        await Promise.all(collectorPromises);
    }

    async runCollectors({
        enforcedRateLimit,
        defaultRateLimit,
        ...collectorsOptions
    }) {
        const exchangeAPI = new ccxt[collectorsOptions.exchange]();
        const rateLimit =
            enforcedRateLimit ?? exchangeAPI.rateLimit ?? defaultRateLimit;

        const collectorsManager = new HistoricalManager({
            models: [CandleStickCollector, TradeCollector],
            exchangeAPI,
            rateLimit,
            ...collectorsOptions,
        });

        await collectorsManager.start();
    }
}

export default CCXTHistoricalCollectorsRunner;
