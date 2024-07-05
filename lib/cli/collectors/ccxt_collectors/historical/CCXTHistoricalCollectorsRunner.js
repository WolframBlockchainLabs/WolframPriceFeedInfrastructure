import { MARKET_MANAGER_IDENTITY_MODIFIERS_DICT } from '#constants/market-manager-identity-modifiers.js';
import HistoricalCollectorsManager from '#domain-collectors/historical-managers/HistoricalCollectorsManager.js';
import HistoricalMarketsAMQPManager from '#domain-collectors/historical-managers/HistoricalMarketsAMQPManager.js';
import HistoricalMarketsManager from '#domain-collectors/historical-managers/HistoricalMarketsManager.js';
import GenericClassFactory from '#domain-collectors/infrastructure/GenericClassFactory.js';
import HistoricalCryptoMarketRepository from '#domain-collectors/infrastructure/repositories/market-repositories/HistoricalCryptoMarketRepository.js';
import RestrictedHistoricalScheduler from '#domain-collectors/infrastructure/schedulers/RestrictedHistoricalScheduler.js';
import HistoricalCandleStickCollector from '#domain-collectors/integrations/ccxt/collectors/HistoricalCandleStickCollector.js';
import CCXTCollectorsRunner from '../CCXTCollectorsRunner.js';
import './options_schema.js';

class CCXTHistoricalCollectorsRunner extends CCXTCollectorsRunner {
    GROUP_NAME = 'historical';

    optionsValidationRules = {
        exchangeIds: ['required', 'string', 'cli_string_format', 'json'],
        scheduleStartDate: ['required', 'cli_string_format', 'iso_date'],
        scheduleEndDate: [
            'required',
            'cli_string_format',
            'iso_date',
            { date_greater_than: 'scheduleStartDate' },
        ],
    };

    async process(options) {
        await super.process(options);

        return Promise.all(
            this.marketsAMQPManagers.map((marketsAMQPManager) =>
                marketsAMQPManager.getSchedulePromise(),
            ),
        );
    }

    setupMarketsAMQPManager(marketsAMQPManagerOptions) {
        return new HistoricalMarketsAMQPManager({
            ...marketsAMQPManagerOptions,
        });
    }

    setupMarketsManagerFactory(marketsManagerOptions) {
        return new GenericClassFactory({
            Class: HistoricalMarketsManager,
            defaultOptions: marketsManagerOptions,
        });
    }

    setupCollectorsManagersFactory(collectorsOptions) {
        return new GenericClassFactory({
            Class: HistoricalCollectorsManager,
            defaultOptions: {
                models: [HistoricalCandleStickCollector],
                ...collectorsOptions,
            },
        });
    }

    setupSchedulersFactory(schedulerOptions) {
        return new GenericClassFactory({
            Class: RestrictedHistoricalScheduler,
            defaultOptions: schedulerOptions,
        });
    }

    getRepositories() {
        return {
            ...super.getRepositories(),
            MarketRepository: HistoricalCryptoMarketRepository,
        };
    }

    getIdentityModifier() {
        return MARKET_MANAGER_IDENTITY_MODIFIERS_DICT.HISTORICAL;
    }
}

export default CCXTHistoricalCollectorsRunner;
