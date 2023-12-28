import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';
import OrderBookCollector from '#domain-collectors/collectors/OrderBookCollector.js';
import TickerCollector from '#domain-collectors/collectors/TickerCollector.js';
import TradeCollector from '#domain-collectors/collectors/TradeCollector.js';
import StableRealtimeScheduler from '#domain-collectors/infrastructure/schedulers/StableRealtimeScheduler.js';
import CCXTCollectorsRunner from '../CCXTCollectorsRunner.js';
import './options_schema.js';

class CCXTRealtimeCollectorsRunner extends CCXTCollectorsRunner {
    optionsValidationRules = {
        exchanges: ['required', 'string', 'json'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        replicaSize: ['required', 'positive_integer'],
        instancePosition: ['required', 'integer'],
    };

    setupCollectorsManager(collectorsOptions) {
        return new CollectorsManager({
            models: [
                CandleStickCollector,
                OrderBookCollector,
                TickerCollector,
                TradeCollector,
            ],
            ...collectorsOptions,
        });
    }

    setupScheduler({ exchange, symbol, ...schedulerOptions }) {
        return new StableRealtimeScheduler({
            taskName: `${exchange}::${symbol}`,
            ...schedulerOptions,
        });
    }
}

export default CCXTRealtimeCollectorsRunner;
