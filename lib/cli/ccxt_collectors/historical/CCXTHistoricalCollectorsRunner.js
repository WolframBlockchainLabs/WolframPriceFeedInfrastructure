import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';
import HistoricalScheduler from '#domain-collectors/infrastructure/schedulers/HistoricalScheduler.js';
import CCXTCollectorsRunner from '../CCXTCollectorsRunner.js';
import './options_schema.js';

class CCXTHistoricalCollectorsRunner extends CCXTCollectorsRunner {
    optionsValidationRules = {
        exchanges: ['required', 'string', 'json'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        scheduleStartDate: ['required', 'string'],
        scheduleEndDate: ['required', 'string'],
    };

    setupCollectorsManager({ rabbitGroupName, ...collectorsOptions }) {
        return new CollectorsManager({
            models: [CandleStickCollector],
            rabbitGroupName: `historical_${rabbitGroupName}`,
            ...collectorsOptions,
        });
    }

    setupScheduler({ exchange, symbol, ...schedulerOptions }) {
        return new HistoricalScheduler({
            taskName: `${exchange}::${symbol}`,
            ...schedulerOptions,
        });
    }
}

export default CCXTHistoricalCollectorsRunner;
