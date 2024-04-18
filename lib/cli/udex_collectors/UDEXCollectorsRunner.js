import udexCollectorsConfig from '#configs/udexCollectorsConfig.cjs';
import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import MarketsManager from '#domain-collectors/MarketsManager.js';
import ExchangeRateCollector from '#domain-collectors/collectors/ExchangeRateCollector.js';
import GenericClassFactory from '#domain-collectors/infrastructure/GenericClassFactory.js';
import BackoffPolicy from '#domain-collectors/infrastructure/amqp-policies/BackoffPolicy.js';
import ReplicaDiscoveryPolicy from '#domain-collectors/infrastructure/amqp-policies/ReplicaDiscoveryPolicy.js';
import StableRealtimeScheduler from '#domain-collectors/infrastructure/schedulers/StableRealtimeScheduler.js';
import UDEXDriverMapper from '#domain-collectors/integrations/udex/UDEXDriverMapper.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import './options_schema.js';

class UDEXCollectorsRunner extends BaseCLIRunner {
    optionsValidationRules = {
        groupName: ['required', 'string'],
    };

    constructor(config) {
        super(config);

        this.udexCollectorsConfig = udexCollectorsConfig;
        this.udexDriverMapper = new UDEXDriverMapper();

        this.queuePosition = 0;
    }

    async process({ options }) {
        const { groupName } = options;
        const groupConfig = this.udexCollectorsConfig[groupName];

        if (!groupConfig) {
            throw new Error(
                `Group configuration for '${groupName}' not found.`,
            );
        }

        await this.runGroupCollectors(groupConfig);
    }

    async runGroupCollectors(groupConfig) {
        const { exchanges } = groupConfig;
        const queueSize = exchanges.reduce(
            (total, exchange) => total + exchange.markets.length,
            0,
        );

        let queueOffset = 0;

        const exchangeProcessingTasks = exchanges.map((exchange) => {
            const promise = this.processExchange({
                groupConfig,
                exchange,
                queueSize,
                queueOffset,
            });

            queueOffset += exchange.markets.length;

            return promise;
        });

        await Promise.all(exchangeProcessingTasks);
    }

    async processExchange({ groupConfig, exchange, queueSize, queueOffset }) {
        const exchangeAPI = await this.initializeExchangeApi({
            groupConfig,
            exchange,
        });

        const marketsManager = this.initMarketsManager({
            exchangeId: exchange.id,
            markets: exchange.markets,
            groupConfig,
            queueOffset,
            queueSize,
            exchangeAPI,
        });

        return marketsManager.start();
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

    initMarketsManager({
        exchangeId,
        markets,
        groupConfig,
        queueOffset,
        queueSize,
        exchangeAPI,
    }) {
        const schedulersFactory = new GenericClassFactory({
            Class: StableRealtimeScheduler,
            defaultOptions: {
                logger: this.logger,
                baseRateLimit: groupConfig.rateLimit,
                rateLimitMargin: groupConfig.rateLimitMargin,
            },
        });

        const collectorsManagersFactory = new GenericClassFactory({
            Class: CollectorsManager,
            defaultOptions: {
                models: [ExchangeRateCollector],
                exchange: exchangeId,
                logger: this.logger,
                amqpClient: this.amqpClient,
                exchangeAPI,
            },
        });

        return new MarketsManager({
            markets,
            logger: this.logger,
            rabbitGroupName: groupConfig.groupName,
            schedulersFactory,
            collectorsManagersFactory,
            queueSize,
            queueOffset,
            AMQPPolicies: [ReplicaDiscoveryPolicy, BackoffPolicy],
            policiesConfigs: this.config.policiesConfigs,
            amqpClientConfig: this.config.rabbitmq,
        });
    }
}

export default UDEXCollectorsRunner;
