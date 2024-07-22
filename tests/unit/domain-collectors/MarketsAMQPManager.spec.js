import MarketsAMQPManager from '#domain-collectors/MarketsAMQPManager.js';
import GenericClassFactory from '#domain-collectors/utils/GenericClassFactory';

describe('[domain-collectors]: MarketsAMQPManager Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.amqpChannelStub = {
            assertQueue: jest.fn(),
            consume: jest.fn(),
            addSetup: jest.fn((func) => func(context.amqpChannelStub)),
            ack: jest.fn(),
        };

        class AMQPClient {
            initConnection = jest.fn();
            closeConnection = jest.fn();
            publish = jest.fn();
            getChannel = jest.fn().mockReturnValue(context.amqpChannelStub);
        }

        context.amqpClientFactoryStub = new GenericClassFactory({
            Class: AMQPClient,
            defaultOptions: 'this.config.rabbitmq',
        });

        context.mockMarketEventManager = {
            init: jest.fn(),
            close: jest.fn(),
        };
        context.marketEventManagerFactory = {
            create: jest.fn().mockReturnValue(context.mockMarketEventManager),
        };

        context.mockBackoffPolicy = {
            start: jest.fn(),
            stop: jest.fn(),
            broadcastRateLimitChange: jest.fn(),
        };

        context.mockHeartbeatPolicy = {
            start: jest.fn(),
            stop: jest.fn(),
            notifyExporters: jest.fn(),
        };

        context.mockLifecyclePolicy = {
            start: jest.fn(),
            stop: jest.fn(),
        };

        context.marketsManagerFactory = { create: jest.fn() };
        context.lifecyclePolicyFactory = {
            create: jest.fn().mockReturnValue(context.mockLifecyclePolicy),
        };
        context.logger = { info: jest.fn() };
        context.externalExchangeId = 'externalId';
        context.policiesConfigs = {};
        context.identityModifier = 'someIdentityModifier';

        context.OuterLifecyclePolicies = [
            jest.fn().mockImplementation(() => context.mockHeartbeatPolicy),
        ];
        context.InnerLifecyclePolicies = [
            jest.fn().mockImplementation(() => context.mockBackoffPolicy),
        ];

        context.ExchangeRepositoryMock = {
            getDataSource: jest.fn().mockResolvedValue(),
            getDataSourceGroupMembers: jest.fn().mockResolvedValue(),
        };

        context.marketsAMQPManager = new MarketsAMQPManager({
            marketEventManagerFactory: context.marketEventManagerFactory,
            marketsManagerFactory: context.marketsManagerFactory,
            logger: context.logger,
            amqpClientFactory: context.amqpClientFactoryStub,
            externalExchangeId: context.externalExchangeId,
            identityModifier: context.identityModifier,
            lifecyclePolicyFactory: context.lifecyclePolicyFactory,
            OuterLifecyclePolicies: context.OuterLifecyclePolicies,
            InnerLifecyclePolicies: context.InnerLifecyclePolicies,
            policiesConfigs: context.policiesConfigs,
            Repositories: {
                ExchangeRepository: context.ExchangeRepositoryMock,
            },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('start method starts all AMQP policies and logs info', async () => {
        context.marketsAMQPManager.initAMQPPolicies();

        const initMarketEventManagerSpy = jest
            .spyOn(context.marketsAMQPManager, 'initMarketEventManager')
            .mockResolvedValue();
        const initMarketManagerSpy = jest
            .spyOn(context.marketsAMQPManager, 'initMarketManager')
            .mockResolvedValue();

        await context.marketsAMQPManager.start();

        expect(initMarketEventManagerSpy).toHaveBeenCalled();
        expect(initMarketManagerSpy).toHaveBeenCalled();
        expect(context.mockLifecyclePolicy.start).toHaveBeenCalled();
        expect(context.logger.info).toHaveBeenCalled();
    });

    test('stop method stops all AMQP policies and logs info', async () => {
        await context.marketsAMQPManager.setupAMQPClient();
        context.marketsAMQPManager.initAMQPPolicies();

        const cleanupSpy = jest
            .spyOn(context.marketsAMQPManager, 'cleanup')
            .mockResolvedValue();

        await context.marketsAMQPManager.stop();

        expect(context.mockBackoffPolicy.stop).toHaveBeenCalled();
        expect(context.mockLifecyclePolicy.stop).toHaveBeenCalled();
        expect(cleanupSpy).toHaveBeenCalled();
        expect(context.logger.info).toHaveBeenCalled();
    });

    test('the "loadRabbitGroup" method should retrieve rabbit group config.', async () => {
        await context.marketsAMQPManager.loadRabbitGroup();

        expect(
            context.ExchangeRepositoryMock.getDataSource,
        ).toHaveBeenCalledTimes(1);
    });

    test('getPolicy method returns the correct policy instance', () => {
        class MockBackoffPolicy {}
        class MockOtherPolicy {}

        const mockBackoffPolicyInstance = new MockBackoffPolicy();
        const mockOtherPolicyInstance = new MockOtherPolicy();

        context.marketsAMQPManager.innerLifecyclePolicies = [
            mockBackoffPolicyInstance,
            mockOtherPolicyInstance,
        ];

        const retrievedBackoffPolicyInstance =
            context.marketsAMQPManager.getPolicy(MockBackoffPolicy);
        expect(retrievedBackoffPolicyInstance).toBe(mockBackoffPolicyInstance);

        const retrievedOtherPolicyInstance =
            context.marketsAMQPManager.getPolicy(MockOtherPolicy);
        expect(retrievedOtherPolicyInstance).toBe(mockOtherPolicyInstance);
    });

    test('cleanup should close the marketEventManager and amqpClient connections', async () => {
        context.marketsAMQPManager.marketEventManager =
            context.mockMarketEventManager;
        context.marketsAMQPManager.amqpClient =
            context.amqpClientFactoryStub.create();

        await context.marketsAMQPManager.cleanup();

        expect(context.mockMarketEventManager.close).toHaveBeenCalledTimes(1);
        expect(
            context.marketsAMQPManager.amqpClient.closeConnection,
        ).toHaveBeenCalledTimes(1);
    });

    test('initMarketEventManager should create and initialize marketEventManager', async () => {
        await context.marketsAMQPManager.initMarketEventManager();

        expect(context.marketEventManagerFactory.create).toHaveBeenCalledWith({
            marketsAMQPManger: context.marketsAMQPManager,
        });
        expect(context.mockMarketEventManager.init).toHaveBeenCalledTimes(1);
    });

    test('initMarketManager should create and initialize marketsManager', async () => {
        const mockMarketsManager = {
            init: jest.fn(),
        };

        context.marketsManagerFactory.create.mockReturnValue(
            mockMarketsManager,
        );
        const mockAmqpClient = context.amqpClientFactoryStub.create();

        context.marketsAMQPManager.marketEventManager =
            context.mockMarketEventManager;
        context.marketsAMQPManager.amqpClient = mockAmqpClient;
        context.marketsAMQPManager.rabbitGroupName = 'testRabbitGroup';

        await context.marketsAMQPManager.initMarketManager();

        expect(context.marketsManagerFactory.create).toHaveBeenCalledWith({
            marketEventManager: context.mockMarketEventManager,
            amqpClient: mockAmqpClient,
            logger: context.logger,
            rabbitGroupName: 'testRabbitGroup',
            externalExchangeId: context.externalExchangeId,
            identityModifier: context.identityModifier,
            Repositories: context.marketsAMQPManager.Repositories,
        });
        expect(mockMarketsManager.init).toHaveBeenCalledTimes(1);
    });
});
