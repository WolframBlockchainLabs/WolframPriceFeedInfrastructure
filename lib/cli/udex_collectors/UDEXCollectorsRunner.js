import udexCollectorsConfig from '#configs/udexCollectorsConfig.cjs';
import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import ExchangeRateCollector from '#domain-collectors/collectors/ExchangeRateCollector.js';
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
        const queueSize = this.calculateTotalMarkets(exchanges);

        const exchangeProcessingTasks = exchanges.map((exchange) =>
            this.processExchange({ groupConfig, exchange, queueSize }),
        );

        await Promise.all(exchangeProcessingTasks);
    }

    async processExchange({ groupConfig, exchange, queueSize }) {
        const exchangeAPI = await this.initializeExchangeApi({
            groupConfig,
            exchange,
        });

        const marketProcessingTasks = exchange.markets.map((market) =>
            this.initCollectors({
                exchangeId: exchange.id,
                market,
                groupConfig,
                queuePosition: this.queuePosition++,
                queueSize,
                exchangeAPI,
            }),
        );

        await Promise.all(marketProcessingTasks);
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

    async initCollectors({
        exchangeId,
        market,
        groupConfig,
        queuePosition,
        queueSize,
        exchangeAPI,
    }) {
        const collectorsScheduler = new StableRealtimeScheduler({
            taskName: `${exchangeId}::${market.symbol}`,
            logger: this.logger,
            queuePosition,
            queueSize,
            baseRateLimit: groupConfig.rateLimit,
            rateLimitMargin: groupConfig.rateLimitMargin,
            replicaSize: groupConfig.replicaSize,
            instancePosition: groupConfig.instancePosition,
        });

        const collectorsManager = new CollectorsManager({
            models: [ExchangeRateCollector],
            exchange: exchangeId,
            pair: market.pair,
            symbol: market.symbol,
            logger: this.logger,
            amqpClient: this.amqpClient,
            collectorsScheduler,
            exchangeAPI,
            rabbitGroupName: groupConfig.groupName,
        });

        await collectorsManager.start();
    }

    calculateTotalMarkets(exchanges) {
        return exchanges.reduce(
            (total, exchange) => total + exchange.markets.length,
            0,
        );
    }
}

export default UDEXCollectorsRunner;
