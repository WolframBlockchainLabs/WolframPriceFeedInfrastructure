import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';
import GenericClassFactory from '#domain-collectors/infrastructure/GenericClassFactory.js';
import HistoricalScheduler from '#domain-collectors/infrastructure/schedulers/HistoricalScheduler.js';
import CCXTCollectorsRunner from '../CCXTCollectorsRunner.js';
import './options_schema.js';

class CCXTHistoricalCollectorsRunner extends CCXTCollectorsRunner {
    optionsValidationRules = {
        exchanges: ['required', 'string', 'json'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        scheduleStartDate: ['required', 'iso_date'],
        scheduleEndDate: [
            'required',
            'iso_date',
            { date_greater_than: 'scheduleStartDate' },
        ],
    };

    setupCollectorsManagersFactory({ rabbitGroupName, ...collectorsOptions }) {
        return new GenericClassFactory({
            Class: CollectorsManager,
            defaultOptions: {
                models: [CandleStickCollector],
                rabbitGroupName: `historical_${rabbitGroupName}`,
                ...collectorsOptions,
            },
        });
    }

    setupSchedulersFactory(schedulerOptions) {
        return new GenericClassFactory({
            Class: HistoricalScheduler,
            defaultOptions: schedulerOptions,
        });
    }
}

export default CCXTHistoricalCollectorsRunner;
