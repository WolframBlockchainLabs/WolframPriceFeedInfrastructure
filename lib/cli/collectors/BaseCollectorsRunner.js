import MarketsAMQPManager from '#domain-collectors/MarketsAMQPManager.js';
import BackoffPolicy from '#domain-collectors/infrastructure/amqp-policies/stateless-policies/BackoffPolicy.js';
import ReplicaDiscoveryPolicy from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/ReplicaDiscoveryPolicy.js';
import GenericClassFactory from '#domain-collectors/infrastructure/GenericClassFactory.js';
import ReplicaStateManager from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/ReplicaStateManager.js';
import AMQPClient from '#infrastructure/amqp/AMQPClient.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import CryptoExchangeRepository from '#domain-collectors/infrastructure/repositories/exchange-repositories/CryptoExchangeRepository.js';
import RealtimeCryptoMarketRepository from '#domain-collectors/infrastructure/repositories/market-repositories/RealtimeCryptoMarketRepository.js';
import MarketEventsManager from '#domain-collectors/infrastructure/market-events/MarketEventsManager.js';
import MarketEventHandlers from '#domain-collectors/infrastructure/market-events/event-handlers/index.js';
import replicaStateReducers from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/reducers/index.js';
import { MARKET_MANAGER_IDENTITY_MODIFIERS_DICT } from '#constants/market-manager-identity-modifiers.js';

class BaseCollectorsRunner extends BaseCLIRunner {
    constructor(options) {
        super(options);

        this.marketsAMQPManagers = [];
    }

    async stop() {
        const marketsAMQPManagersStopPromises = this.marketsAMQPManagers.map(
            (marketsAMQPManager) => marketsAMQPManager.stop(),
        );

        return Promise.all(marketsAMQPManagersStopPromises);
    }

    async initMarketsAMQPManager(options) {
        const marketEventManagerFactory = this.setupMarketEventManagerFactory();
        const lifecyclePolicyFactory = this.setupLifecyclePolicyFactory();
        const amqpClientFactory = this.setupAMQPClientFactory();

        const marketsAMQPManager = this.setupMarketsAMQPManager({
            marketEventManagerFactory,
            lifecyclePolicyFactory,
            amqpClientFactory,
            InnerLifecyclePolicies: [BackoffPolicy],
            OuterLifecyclePolicies: [],
            Repositories: this.getRepositories(),
            identityModifier: this.getIdentityModifier(),
            ...options,
        });

        await marketsAMQPManager.start();

        this.marketsAMQPManagers.push(marketsAMQPManager);
    }

    setupMarketsAMQPManager(marketsAMQPManagerOptions) {
        return new MarketsAMQPManager({
            ...marketsAMQPManagerOptions,
        });
    }

    setupMarketEventManagerFactory() {
        return new GenericClassFactory({
            Class: MarketEventsManager,
            defaultOptions: {
                MarketEventHandlers,
            },
        });
    }

    setupLifecyclePolicyFactory() {
        const stateManagerFactory = new GenericClassFactory({
            Class: ReplicaStateManager,
            defaultOptions: {
                Reducers: replicaStateReducers,
            },
        });

        return new GenericClassFactory({
            Class: ReplicaDiscoveryPolicy,
            defaultOptions: {
                stateManagerFactory,
            },
        });
    }

    setupAMQPClientFactory() {
        return new GenericClassFactory({
            Class: AMQPClient,
            defaultOptions: this.config.rabbitmq,
        });
    }

    getRepositories() {
        return {
            ExchangeRepository: CryptoExchangeRepository,
            MarketRepository: RealtimeCryptoMarketRepository,
        };
    }

    getIdentityModifier() {
        return MARKET_MANAGER_IDENTITY_MODIFIERS_DICT.REALTIME;
    }
}

export default BaseCollectorsRunner;
