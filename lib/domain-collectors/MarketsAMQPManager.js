class MarketsAMQPManager {
    constructor({
        marketEventManagerFactory,
        marketsManagerFactory,
        logger,
        amqpClientFactory,
        externalExchangeId,
        identityModifier,
        lifecyclePolicyFactory,
        OuterLifecyclePolicies,
        InnerLifecyclePolicies,
        policiesConfigs,
        Repositories,
    }) {
        this.marketEventManagerFactory = marketEventManagerFactory;
        this.marketsManagerFactory = marketsManagerFactory;
        this.amqpClientFactory = amqpClientFactory;
        this.logger = logger;

        this.externalExchangeId = externalExchangeId;
        this.identityModifier = identityModifier;
        this.rabbitGroupName = null;

        this.lifecyclePolicyFactory = lifecyclePolicyFactory;
        this.lifecyclePolicy = null;
        this.OuterLifecyclePolicies = OuterLifecyclePolicies;
        this.InnerLifecyclePolicies = InnerLifecyclePolicies;
        this.policiesConfigs = policiesConfigs;
        this.outerLifecyclePolicies = [];
        this.innerLifecyclePolicies = [];

        this.Repositories = Repositories;
        this.ExchangeRepository = Repositories.ExchangeRepository;
        this.marketsManager = null;
        this.marketEventManager = null;
    }

    async start() {
        await this.init();

        for (const preStartPolicy of this.outerLifecyclePolicies) {
            await preStartPolicy.start();
        }

        await this.lifecyclePolicy.start();

        for (const postStartPolicy of this.innerLifecyclePolicies) {
            await postStartPolicy.start();
        }

        this.logger.info({
            message: `${this.constructor.name} has been started`,
            context: this.getLogContext(),
        });
    }

    async stop() {
        for (const postStartPolicy of this.innerLifecyclePolicies) {
            await postStartPolicy.stop();
        }

        await this.lifecyclePolicy.stop();

        for (const preStartPolicy of this.outerLifecyclePolicies) {
            await preStartPolicy.stop();
        }

        await this.cleanup();

        this.logger.info({
            message: `${this.constructor.name} has been stopped`,
            context: this.getLogContext(),
        });
    }

    async init() {
        await this.setupAMQPClient();
        await this.loadRabbitGroup();

        await this.initMarketEventManager();
        await this.initMarketManager();

        this.initAMQPPolicies();
    }

    async cleanup() {
        await this.marketEventManager.close();

        await this.amqpClient.closeConnection();
    }

    async setupAMQPClient() {
        this.amqpClient = this.amqpClientFactory.create();

        await this.amqpClient.initConnection();
    }

    async loadRabbitGroup() {
        this.rabbitGroupName = await this.ExchangeRepository.getDataSource(
            this.externalExchangeId,
        );
    }

    async initMarketEventManager() {
        this.marketEventManager = this.marketEventManagerFactory.create({
            marketsAMQPManger: this,
        });

        await this.marketEventManager.init();
    }

    async initMarketManager() {
        this.marketsManager = this.marketsManagerFactory.create({
            marketEventManager: this.marketEventManager,
            amqpClient: this.amqpClient,
            logger: this.logger,
            rabbitGroupName: this.rabbitGroupName,
            externalExchangeId: this.externalExchangeId,
            identityModifier: this.identityModifier,
            Repositories: this.Repositories,
        });

        await this.marketsManager.init();
    }

    initAMQPPolicies() {
        const policyConfig = {
            amqpClientFactory: this.amqpClientFactory,
            rabbitGroupName: this.rabbitGroupName,
            marketsManager: this.marketsManager,
            marketEventManager: this.marketEventManager,
            policiesConfigs: this.policiesConfigs,
        };

        this.outerLifecyclePolicies = this.OuterLifecyclePolicies.map(
            (PreStartPolicy) => {
                return new PreStartPolicy(policyConfig);
            },
        );
        this.innerLifecyclePolicies = this.InnerLifecyclePolicies.map(
            (PostStartPolicy) => {
                return new PostStartPolicy(policyConfig);
            },
        );

        this.lifecyclePolicy = this.lifecyclePolicyFactory.create(policyConfig);
    }

    getPolicy(PolicyType) {
        const amqpPolicies = [
            ...this.innerLifecyclePolicies,
            ...this.outerLifecyclePolicies,
            this.lifecyclePolicy,
        ];

        return amqpPolicies.find((amqpPolicy) => {
            return amqpPolicy instanceof PolicyType;
        });
    }

    getLogContext() {
        return {
            rabbitGroupName: this.rabbitGroupName,
            externalExchangeId: this.externalExchangeId,
            identityModifier: this.identityModifier,
        };
    }
}

export default MarketsAMQPManager;
