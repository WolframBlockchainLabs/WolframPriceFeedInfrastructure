import HistoricalManager from '#domain-collectors/HistoricalManager.js';
import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';
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

    async runCollectors(collectorsOptions) {
        const collectorsManager = new HistoricalManager({
            models: [CandleStickCollector],
            ...collectorsOptions,
        });

        await collectorsManager.start();
    }
}

export default CCXTHistoricalCollectorsRunner;
