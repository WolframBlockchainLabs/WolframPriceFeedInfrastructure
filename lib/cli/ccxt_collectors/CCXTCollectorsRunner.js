import MarketsManager from '#domain-collectors/MarketsManager.js';
import BackoffPolicy from '#domain-collectors/infrastructure/amqp-policies/BackoffPolicy.js';
import ReplicaDiscoveryPolicy from '#domain-collectors/infrastructure/amqp-policies/ReplicaDiscoveryPolicy.js';
import CCXTDriverWrapper from '#domain-collectors/integrations/ccxt/CCXTDriverWrapper.js';
import BaseCLIRunner from '../BaseCLIRunner.js';

class CCXTCollectorsRunner extends BaseCLIRunner {
    async process({ options: { exchanges, ...collectorsOptions } }) {
        const exchangePromises = exchanges.map((exchange) => {
            return this.processExchange({
                exchange,
                ...collectorsOptions,
            });
        });

        await Promise.all(exchangePromises);
    }

    async processExchange({ exchange, rateLimit, ...schedulerOptions }) {
        const exchangeAPI = await this.initExchangeAPI(exchange);

        const marketsManager = this.initMarketsManager({
            exchange,
            rateLimit,
            exchangeAPI,
            schedulerOptions,
        });

        return marketsManager.start();
    }

    async initExchangeAPI({ id, ...options }) {
        const exchangeAPI = new CCXTDriverWrapper({
            exchangeId: id,
            ...options,
        });

        await exchangeAPI.loadMarkets();

        return exchangeAPI;
    }

    initMarketsManager({ exchange, rateLimit, exchangeAPI, schedulerOptions }) {
        const baseRateLimit =
            exchange.rateLimit ?? exchangeAPI.rateLimit ?? rateLimit;

        const schedulersFactory = this.setupSchedulersFactory({
            logger: this.logger,
            baseRateLimit,
            minimalCycleDuration: exchange.minimalCycleDuration,
            ...schedulerOptions,
        });

        const collectorsManagersFactory = this.setupCollectorsManagersFactory({
            exchange: exchange.id,
            exchangeAPI,
            amqpClient: this.amqpClient,
            logger: this.logger,
        });

        return new MarketsManager({
            markets: exchange.symbols.map((symbol) => ({ symbol })),
            logger: this.logger,
            rabbitGroupName: exchange.id,
            schedulersFactory,
            collectorsManagersFactory,
            AMQPPolicies: [ReplicaDiscoveryPolicy, BackoffPolicy],
            policiesConfigs: this.config.policiesConfigs,
            amqpClientConfig: this.config.rabbitmq,
        });
    }
}

export default CCXTCollectorsRunner;
