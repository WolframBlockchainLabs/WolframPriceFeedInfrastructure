import udexCollectorsConfig from '#configs/udexCollectorsConfig.cjs';
import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import MarketsManager from '#domain-collectors/MarketsManager.js';
import ExchangeRateCollector from '#domain-collectors/collectors/ExchangeRateCollector.js';
import GenericClassFactory from '#domain-collectors/utils/GenericClassFactory.js';
import RestrictedRealtimeScheduler from '#domain-collectors/infrastructure/schedulers/RestrictedRealtimeScheduler.js';
import UDEXDriverMapper from '#domain-collectors/integrations/udex/UDEXDriverMapper.js';
import BaseCollectorsRunner from '../BaseCollectorsRunner.js';
import './options_schema.js';

class UDEXCollectorsRunner extends BaseCollectorsRunner {
    optionsValidationRules = {
        groupName: ['required', 'string', 'cli_string_format'],
        exchangeIds: ['required', 'string', 'cli_string_format', 'json'],
    };

    constructor(config) {
        super(config);

        this.udexDriverMapper = new UDEXDriverMapper();
    }

    async process({ options: { groupName, exchangeIds } }) {
        const { exchanges, ...groupConfig } = this.resolveConfig({
            groupName,
            exchangeIds,
        });

        this.logger.info({
            message: 'Initializing UDEX collectors',
            groupName,
            exchangeIds,
        });

        const exchangeProcessingTasks = exchanges.map((exchange) => {
            const promise = this.processExchange({
                groupConfig,
                exchange,
            });

            return promise;
        });

        await Promise.all(exchangeProcessingTasks);
    }

    async processExchange({ groupConfig, exchange }) {
        const marketsManagerFactory = await this.getMarketsManagerFactory({
            exchangeId: exchange.id,
            groupConfig,
            exchange,
        });

        await this.initMarketsAMQPManager({
            marketsManagerFactory,
            logger: this.logger,
            amqpClient: this.amqpClient,
            externalExchangeId: exchange.id,
            policiesConfigs: this.config.policiesConfigs,
        });
    }

    async getMarketsManagerFactory({ groupConfig, exchange }) {
        const exchangeAPI = await this.initializeExchangeApi({
            groupConfig,
            exchange,
        });

        const schedulersFactory = new GenericClassFactory({
            Class: RestrictedRealtimeScheduler,
            defaultOptions: {
                baseRateLimit: groupConfig.rateLimit,
                rateLimitMargin: groupConfig.rateLimitMargin,
                baseSleepReloadTime: groupConfig.baseSleepReloadTime,
            },
        });

        const collectorsManagersFactory = new GenericClassFactory({
            Class: CollectorsManager,
            defaultOptions: {
                models: [ExchangeRateCollector],
                exchangeAPI,
            },
        });

        return new GenericClassFactory({
            Class: MarketsManager,
            defaultOptions: {
                schedulersFactory,
                collectorsManagersFactory,
            },
        });
    }

    async initializeExchangeApi({ groupConfig, exchange }) {
        const { groupName, apiSecret, meta } = groupConfig;

        const UDEXDriver = await this.udexDriverMapper.getDriver({
            groupName,
            exchange: exchange.id,
        });
        const udexDriver = new UDEXDriver({ apiSecret, meta });

        return udexDriver;
    }

    resolveConfig({ groupName, exchangeIds }) {
        const groupConfig = udexCollectorsConfig[groupName];
        const exchangeIdsSet = new Set(exchangeIds);

        return {
            ...groupConfig,
            exchanges: groupConfig.exchanges.filter((exchange) =>
                exchangeIdsSet.has(exchange.id),
            ),
        };
    }
}

export default UDEXCollectorsRunner;
