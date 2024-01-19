import MarketsManager from '#domain-collectors/MarketsManager.js';
import BackoffPolicy from '#domain-collectors/infrastructure/amqp-policies/BackoffPolicy.js';

describe('MarketsManager', () => {
    const context = {};

    beforeAll(() => {
        context.mockSchedulersFactory = { create: jest.fn() };
        context.mockCollectorsManagersFactory = { create: jest.fn() };

        context.mockSchedulersFactory.create.mockReturnValue({});
        context.mockCollectorsManagersFactory.create.mockReturnValue({
            getCollectorManagerTaskName: jest.fn(),
        });

        context.mockLogger = { info: jest.fn(), error: jest.fn() };

        context.mockAmqpClient = {};

        context.marketsManager = new MarketsManager({
            markets: [{}, {}],
            logger: context.mockLogger,
            amqpClient: context.mockAmqpClient,
            rabbitGroupName: 'testGroup',
            schedulersFactory: context.mockSchedulersFactory,
            collectorsManagersFactory: context.mockCollectorsManagersFactory,
            queueOffset: context.mockQueueOffset,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('constructor initializes properties correctly', () => {
        expect(context.marketsManager.rabbitGroupName).toBe('testGroup');
    });

    test('start method starts all AMQP policies', async () => {
        context.marketsManager.amqpPolicies = [
            {
                start: jest.fn(),
            },
            {
                start: jest.fn(),
            },
        ];

        await context.marketsManager.start();

        context.marketsManager.amqpPolicies.forEach((policy) => {
            expect(policy.start).toHaveBeenCalled();
        });
    });

    test('startMarkets starts all market collectors with dynamic config', async () => {
        const dynamicConfig = { someConfig: 'value' };

        context.marketsManager.collectorsManagers = [
            {
                start: jest.fn(),
            },
            {
                start: jest.fn(),
            },
        ];

        await context.marketsManager.startMarkets(dynamicConfig);

        context.marketsManager.collectorsManagers.forEach(
            (collectorsManager) => {
                expect(collectorsManager.start).toHaveBeenCalledWith(
                    dynamicConfig,
                );
            },
        );
    });

    test('getRateLimitMultiplier method returns the maximum rate limit multiplier from all collectors managers', () => {
        const mockRateLimitMultipliers = [1, 3, 2];
        context.mockCollectorsManagersFactory.create.mockImplementation(() => ({
            getRateLimitMultiplier: jest
                .fn()
                .mockImplementation(() => mockRateLimitMultipliers.shift()),
            getCollectorManagerTaskName: jest.fn(),
        }));
        context.marketsManager.collectorsManagers = [];

        context.marketsManager.initMarkets();

        const result = context.marketsManager.getRateLimitMultiplier();

        expect(result).toEqual({ rateLimitMultiplier: 3 });

        context.marketsManager.collectorsManagers.forEach(
            (collectorsManager) => {
                expect(
                    collectorsManager.getRateLimitMultiplier,
                ).toHaveBeenCalled();
            },
        );
    });

    describe('reloadMarkets method', () => {
        test('acquires and releases mutex, updates rate limit, and logs success', async () => {
            const dynamicConfig = { rateLimit: 5 };
            const releaseMock = jest.fn();
            const reloadMutexMock = {
                acquire: jest.fn().mockResolvedValue(releaseMock),
            };
            context.marketsManager.reloadMutex = reloadMutexMock;
            context.marketsManager.collectorsManagers = [];

            context.mockCollectorsManagersFactory.create.mockImplementation(
                () => ({
                    reloadScheduler: jest.fn().mockResolvedValue(),
                    getCollectorManagerTaskName: jest.fn(),
                }),
            );

            context.marketsManager.initMarkets();

            await context.marketsManager.reloadMarkets(dynamicConfig);

            expect(reloadMutexMock.acquire).toHaveBeenCalled();
            expect(releaseMock).toHaveBeenCalled();

            context.marketsManager.collectorsManagers.forEach(
                (collectorsManager) => {
                    expect(
                        collectorsManager.reloadScheduler,
                    ).toHaveBeenCalledWith(dynamicConfig);
                },
            );

            expect(context.mockLogger.info).toHaveBeenCalled();
        });

        test('logs error if reloadScheduler throws', async () => {
            const dynamicConfig = { rateLimit: 5 };
            const releaseMock = jest.fn();
            const reloadMutexMock = {
                acquire: jest.fn().mockResolvedValue(releaseMock),
            };
            context.marketsManager.reloadMutex = reloadMutexMock;

            const error = new Error('Test error');
            context.mockCollectorsManagersFactory.create.mockImplementation(
                () => ({
                    reloadScheduler: jest.fn().mockRejectedValue(error),
                    getCollectorManagerTaskName: jest.fn(),
                }),
            );

            context.marketsManager.initMarkets();

            await context.marketsManager.reloadMarkets(dynamicConfig);

            expect(context.mockLogger.error).toHaveBeenCalled();
            expect(releaseMock).toHaveBeenCalled();
        });
    });

    describe('broadcastRateLimitChange method', () => {
        test('calls broadcastRateLimitChange on BackoffPolicy instance with correct rateLimitMultiplier', async () => {
            const rateLimitMultiplier = 2;
            const broadcastRateLimitChangeMock = jest.fn().mockResolvedValue();
            class BackoffPolicyMock extends BackoffPolicy {
                broadcastRateLimitChange = broadcastRateLimitChangeMock;
            }

            context.marketsManager.AMQPPolicies.push(BackoffPolicyMock);
            context.marketsManager.initAMQPPolicies();

            await context.marketsManager.broadcastRateLimitChange(
                rateLimitMultiplier,
            );

            expect(broadcastRateLimitChangeMock).toHaveBeenCalledWith(
                rateLimitMultiplier,
            );
        });

        test('does nothing if no BackoffPolicy instance is found', async () => {
            context.marketsManager.amqpPolicies = [];

            await expect(
                context.marketsManager.broadcastRateLimitChange(2),
            ).resolves.toBeUndefined();
        });
    });
});
