import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import MarketsManager from '#domain-collectors/MarketsManager.js';
import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';
import OrderBookCollector from '#domain-collectors/collectors/OrderBookCollector.js';
import TickerCollector from '#domain-collectors/collectors/TickerCollector.js';
import TradeCollector from '#domain-collectors/collectors/TradeCollector.js';
import GenericClassFactory from '#domain-collectors/utils/GenericClassFactory.js';
import RestrictedRealtimeScheduler from '#domain-collectors/infrastructure/schedulers/RestrictedRealtimeScheduler.js';
import CCXTCollectorsRunner from '../CCXTCollectorsRunner.js';
import './options_schema.js';

class CCXTRealtimeCollectorsRunner extends CCXTCollectorsRunner {
    GROUP_NAME = 'realtime';

    optionsValidationRules = {
        exchangeIds: ['required', 'string', 'cli_string_format', 'json'],
    };

    setupMarketsManagerFactory(marketsManagerOptions) {
        return new GenericClassFactory({
            Class: MarketsManager,
            defaultOptions: marketsManagerOptions,
        });
    }

    setupCollectorsManagersFactory(collectorsOptions) {
        return new GenericClassFactory({
            Class: CollectorsManager,
            defaultOptions: {
                models: [
                    CandleStickCollector,
                    OrderBookCollector,
                    TickerCollector,
                    TradeCollector,
                ],
                ...collectorsOptions,
            },
        });
    }

    setupSchedulersFactory(schedulerOptions) {
        return new GenericClassFactory({
            Class: RestrictedRealtimeScheduler,
            defaultOptions: schedulerOptions,
        });
    }
}

export default CCXTRealtimeCollectorsRunner;
