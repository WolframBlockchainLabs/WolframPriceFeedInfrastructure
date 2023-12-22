import udexCollectorsConfig from '#configs/udexCollectorsConfig.cjs';
import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import ExchangeRateCollector from '#domain-collectors/collectors/ExchangeRateCollector.js';
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
            this.runCollector({
                exchangeId: exchange.id,
                market,
                groupConfig,
                queuePosition: this.getNextQueuePosition(),
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

        await udexDriver?.start?.();

        return udexDriver;
    }

    getNextQueuePosition() {
        return this.queuePosition++;
    }

    async runCollector({
        exchangeId,
        market,
        groupConfig,
        queuePosition,
        queueSize,
        exchangeAPI,
    }) {
        const { pair, symbol } = market;
        const {
            groupName,
            rateLimit,
            rateLimitMargin,
            replicaSize,
            instancePosition,
        } = groupConfig;

        const collectorsManager = new CollectorsManager({
            models: [ExchangeRateCollector],
            exchange: exchangeId,
            pair,
            symbol,
            logger: this.logger,
            amqpClient: this.amqpClient,
            exchangeAPI,
            rabbitGroupName: groupName,
            schedulerOptions: {
                queuePosition,
                queueSize,
                baseRateLimit: rateLimit,
                rateLimitMargin,
                replicaSize,
                instancePosition,
            },
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
