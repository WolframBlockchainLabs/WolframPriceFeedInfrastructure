import MarketsManager from '#domain-collectors/MarketsManager.js';
import MarketManagerException from '#domain-model/exceptions/collectors/control-plane/MarketManagerException.js';

describe('[domain-collectors]: MarketsManager Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };
        context.amqpClientStub = {};
        context.rabbitGroupNameStub = 'testGroup';
        context.externalExchangeIdStub = 'testExchangeId';
        context.identityModifierStub = 'testIdentity';
        context.schedulersFactoryStub = {
            create: jest.fn().mockImplementation(() => ({
                start: jest.fn(),
                stop: jest.fn(),
                reload: jest.fn(),
                setDynamicConfig: jest.fn(),
                getDynamicConfig: jest.fn().mockReturnValue({}),
                getQueueSize: jest.fn().mockReturnValue(2),
                getInstancePosition: jest.fn().mockReturnValue(0),
                getPreciseInterval: jest.fn().mockReturnValue(2),
                setQueueSize: jest.fn(),
                getReloadSleepTime: jest.fn().mockReturnValue(2000),
            })),
        };
        context.collectorsManagersFactoryStub = {
            create: jest.fn().mockImplementation(() => ({
                start: jest.fn(),
                stop: jest.fn(),
                reload: jest.fn(),
                reloadActive: jest.fn(),
                getCollectorManagerTaskName: jest.fn(),
                getMarketId: jest.fn(),
                setDynamicConfig: jest.fn(),
                getStatus: jest.fn().mockReturnValue('UP'),
            })),
            getOptions: jest.fn().mockReturnValue({ models: [] }),
        };
        context.marketEventManagerStub = {
            emitAsync: jest.fn(),
        };

        context.MarketRepositoryMock = {
            getQueueSize: jest.fn().mockResolvedValue(2),
            getMarketIds: jest.fn().mockResolvedValue([1, 2]),
        };

        context.marketsManager = new MarketsManager({
            logger: context.loggerStub,
            amqpClient: context.amqpClientStub,
            rabbitGroupName: context.rabbitGroupNameStub,
            externalExchangeId: context.externalExchangeIdStub,
            identityModifier: context.identityModifierStub,
            schedulersFactory: context.schedulersFactoryStub,
            collectorsManagersFactory: context.collectorsManagersFactoryStub,
            marketEventManager: context.marketEventManagerStub,
            Repositories: {
                MarketRepository: context.MarketRepositoryMock,
            },
        });

        context.marketsManager.internalScheduler =
            context.schedulersFactoryStub.create();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('init should correctly initialize the internalScheduler', async () => {
        context.collectorsManagersFactoryStub.getOptions.mockReturnValue({
            models: ['model1', 'model2'],
        });
        context.MarketRepositoryMock.getQueueSize.mockResolvedValue(5);

        await context.marketsManager.init();

        expect(context.MarketRepositoryMock.getQueueSize).toHaveBeenCalledWith(
            context.externalExchangeIdStub,
        );
        expect(context.schedulersFactoryStub.create).toHaveBeenCalledWith({
            logger: context.loggerStub,
            queueSize: 5,
            operations: ['model1', 'model2'],
        });
    });

    test('the "start" method should call necessary methods for setup and log info', async () => {
        jest.spyOn(context.marketsManager, 'loadMarkets').mockResolvedValue();
        const dynamicConfig = { rateLimitMultiplier: 2 };
        context.marketsManager.internalScheduler = {
            getDynamicConfig: jest.fn().mockReturnValue(dynamicConfig),
            getPreciseInterval: jest.fn().mockReturnValue(2),
            setDynamicConfig: jest.fn(),
        };

        await context.marketsManager.start(dynamicConfig);

        expect(context.marketsManager.loadMarkets).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.any(Object),
        );
    });

    test('the "start" method should wrap errors when starting collectors', async () => {
        const mockError = new Error('Test error');
        const collectorsManagersMock = [
            { start: jest.fn().mockResolvedValue() },
            { start: jest.fn().mockRejectedValue(mockError) },
        ];
        context.marketsManager.collectorsManagers = collectorsManagersMock;
        const dynamicConfig = { rateLimitMultiplier: 2 };
        context.marketsManager.internalScheduler = {
            getDynamicConfig: jest.fn().mockReturnValue(dynamicConfig),
            getPreciseInterval: jest.fn().mockReturnValue(2),
            setDynamicConfig: jest.fn(),
        };
        jest.spyOn(context.marketsManager, 'loadMarkets').mockResolvedValue();

        await expect(() =>
            context.marketsManager.start(),
        ).rejects.toBeInstanceOf(MarketManagerException);

        collectorsManagersMock.forEach((manager) => {
            expect(manager.start).toHaveBeenCalledWith({});
        });

        expect(context.marketsManager.loadMarkets).toHaveBeenCalledTimes(1);
    });

    test('the "stop" method should call stop on collectors managers and log info', async () => {
        await context.marketsManager.stop();

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.any(Object),
        );

        context.marketsManager.collectorsManagers.forEach((manager) => {
            expect(manager.stop).toHaveBeenCalledTimes(1);
        });
    });

    test('the "stop" method should handle errors when stopping collectors', async () => {
        const mockError = new Error('Test error');

        const collectorsManagersMock = [
            { stop: jest.fn().mockResolvedValue() },
            { stop: jest.fn().mockRejectedValue(mockError) },
        ];
        context.marketsManager.collectorsManagers = collectorsManagersMock;

        await expect(() =>
            context.marketsManager.stop(),
        ).rejects.toBeInstanceOf(MarketManagerException);

        collectorsManagersMock.forEach((manager) => {
            expect(manager.stop).toHaveBeenCalled();
        });
    });

    test('the "reload" method should stop and then start with new configuration', async () => {
        jest.spyOn(context.marketsManager, 'stop').mockResolvedValue();
        jest.spyOn(context.marketsManager, 'start').mockResolvedValue();

        const dynamicConfig = { rateLimitMultiplier: 2 };
        await context.marketsManager.reload(dynamicConfig);

        expect(context.marketsManager.stop).toHaveBeenCalledTimes(1);
        expect(context.marketsManager.start).toHaveBeenCalledWith(
            dynamicConfig,
        );
    });

    test('the "reload" method should handle errors when reloading collectors', async () => {
        const mockError = new Error('Test error');

        jest.spyOn(context.marketsManager, 'stop').mockResolvedValue();
        jest.spyOn(context.marketsManager, 'start').mockRejectedValue(
            mockError,
        );

        await expect(() =>
            context.marketsManager.reload(),
        ).rejects.toBeInstanceOf(MarketManagerException);

        expect(context.marketsManager.stop).toHaveBeenCalledTimes(1);
        expect(context.marketsManager.start).toHaveBeenCalledWith({});
    });

    test('the "reloadActive" method should reload active markets with new configuration', async () => {
        const dynamicConfig = { rateLimitMultiplier: 2 };

        await context.marketsManager.reloadActive(dynamicConfig);

        context.marketsManager.collectorsManagers.forEach((manager) => {
            expect(manager.reloadActive).toHaveBeenCalledWith(dynamicConfig);
        });
        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.any(Object),
        );
    });

    test('the "reloadActive" method should handle errors when reloading collectors', async () => {
        const mockError = new Error('Test error');

        const collectorsManagersMock = [
            { reloadActive: jest.fn().mockResolvedValue() },
            { reloadActive: jest.fn().mockRejectedValue(mockError) },
        ];
        context.marketsManager.collectorsManagers = collectorsManagersMock;

        await expect(() =>
            context.marketsManager.reloadActive(),
        ).rejects.toBeInstanceOf(MarketManagerException);

        collectorsManagersMock.forEach((manager) => {
            expect(manager.reloadActive).toHaveBeenCalled();
        });
    });

    test('loadMarkets should initialize markets and collectors managers', async () => {
        context.MarketRepositoryMock.getMarketIds.mockResolvedValue([1, 2]);

        await context.marketsManager.loadMarkets();

        expect(context.MarketRepositoryMock.getQueueSize).toHaveBeenCalledWith(
            context.externalExchangeIdStub,
        );
        expect(context.MarketRepositoryMock.getMarketIds).toHaveBeenCalledWith(
            context.externalExchangeIdStub,
        );
        expect(context.schedulersFactoryStub.create).toHaveBeenCalled();
        expect(context.collectorsManagersFactoryStub.create).toHaveBeenCalled();
    });

    test('getMarketStatuses should return market statuses based on provided market IDs', () => {
        const mockCollectorManager1 = {
            getMarketId: () => 1,
            getCollectorManagerTaskName: () => 'Task1',
            getStatus: () => 'UP',
        };
        const mockCollectorManager2 = {
            getMarketId: () => 2,
            getCollectorManagerTaskName: () => 'Task2',
            getStatus: () => 'DOWN',
        };
        context.marketsManager.collectorsManagersMap.set(
            1,
            mockCollectorManager1,
        );
        context.marketsManager.collectorsManagersMap.set(
            2,
            mockCollectorManager2,
        );

        const marketIds = [1, 2];
        const expectedStatuses = [
            {
                marketId: 1,
                replicaInstancePosition: context.schedulersFactoryStub
                    .create()
                    .getInstancePosition(),
                taskName: 'Task1',
                status: 'UP',
            },
            {
                marketId: 2,
                replicaInstancePosition: context.schedulersFactoryStub
                    .create()
                    .getInstancePosition(),
                taskName: 'Task2',
                status: 'DOWN',
            },
        ];

        const result = context.marketsManager.getMarketStatuses({ marketIds });

        expect(result).toEqual(expectedStatuses);
    });

    test('getMarketStatuses should call getCollectorManagers', () => {
        jest.spyOn(
            context.marketsManager,
            'getCollectorManagers',
        ).mockReturnValue([]);

        context.marketsManager.getMarketStatuses();

        expect(context.marketsManager.getCollectorManagers).toHaveBeenCalled();
    });

    test('getCollectorManagers should return collector managers for provided market IDs', () => {
        const mockCollectorManager1 = { getMarketId: () => 1 };
        const mockCollectorManager2 = { getMarketId: () => 2 };

        context.marketsManager.collectorsManagersMap.set(
            1,
            mockCollectorManager1,
        );
        context.marketsManager.collectorsManagersMap.set(
            2,
            mockCollectorManager2,
        );

        const marketIds = [1, 2];
        const expectedManagers = [mockCollectorManager1, mockCollectorManager2];

        const result = context.marketsManager.getCollectorManagers(marketIds);

        expect(result).toEqual(expectedManagers);
    });

    test('getCollectorManagers should return all collectors managers if marketIds are not provided', () => {
        const mockCollectorManager1 = { getMarketId: () => 1 };
        const mockCollectorManager2 = { getMarketId: () => 2 };

        context.marketsManager.collectorsManagers = [
            mockCollectorManager1,
            mockCollectorManager2,
        ];

        const result = context.marketsManager.getCollectorManagers();

        expect(result).toEqual([mockCollectorManager1, mockCollectorManager2]);
    });

    test('resolveMarkets should initialize new markets and update existing markets', async () => {
        const marketIds = [1, 2];
        const initMarketMock = jest
            .spyOn(context.marketsManager, 'initMarket')
            .mockImplementation();
        const updateMarketMock = jest
            .spyOn(context.marketsManager, 'updateMarket')
            .mockImplementation();

        context.marketsManager.collectorsManagersMap.set(1, { existing: true });

        await context.marketsManager.resolveMarkets(marketIds);

        expect(initMarketMock).toHaveBeenCalledWith({
            marketId: 2,
            queuePosition: 1,
        });
        expect(updateMarketMock).toHaveBeenCalledWith({
            marketId: 1,
            queuePosition: 0,
        });

        initMarketMock.mockRestore();
        updateMarketMock.mockRestore();
    });

    test('clearDisabledMarkets should keep active markets and remove disabled ones', () => {
        const activeMarketIds = [1, 2];
        const inactiveMarketId = 3;

        const activeCollectorManager1 = { getMarketId: () => 1 };
        const activeCollectorManager2 = { getMarketId: () => 2 };
        const inactiveCollectorManager = {
            getMarketId: () => inactiveMarketId,
        };

        context.marketsManager.collectorsManagers = [
            activeCollectorManager1,
            activeCollectorManager2,
            inactiveCollectorManager,
        ];

        context.marketsManager.collectorsManagersMap.set(
            1,
            activeCollectorManager1,
        );
        context.marketsManager.collectorsManagersMap.set(
            2,
            activeCollectorManager2,
        );
        context.marketsManager.collectorsManagersMap.set(
            inactiveMarketId,
            inactiveCollectorManager,
        );

        context.marketsManager.clearDisabledMarkets(activeMarketIds);

        expect(context.marketsManager.collectorsManagers).toEqual([
            activeCollectorManager1,
            activeCollectorManager2,
        ]);
        expect(context.marketsManager.collectorsManagersMap.has(1)).toBe(true);
        expect(context.marketsManager.collectorsManagersMap.has(2)).toBe(true);
        expect(
            context.marketsManager.collectorsManagersMap.has(inactiveMarketId),
        ).toBe(false);
    });

    test('updateMarket should correctly set dynamic config on the collectors manager', () => {
        const mockCollectorManager = {
            setDynamicConfig: jest.fn(),
        };
        context.marketsManager.collectorsManagersMap.set(
            1,
            mockCollectorManager,
        );

        const dynamicConfig = { rateLimitMultiplier: 2 };
        context.marketsManager.internalScheduler = {
            getDynamicConfig: jest.fn().mockReturnValue(dynamicConfig),
            getQueueSize: jest.fn().mockReturnValue(5),
        };

        context.marketsManager.updateMarket({ marketId: 1, queuePosition: 3 });

        expect(mockCollectorManager.setDynamicConfig).toHaveBeenCalledWith({
            ...dynamicConfig,
            queuePosition: 3,
            queueSize: 5,
        });
    });

    test('getIdentity should return the correct identity string', () => {
        const identity = context.marketsManager.getIdentity();
        expect(identity).toBe(
            `${context.externalExchangeIdStub}::${context.identityModifierStub}`,
        );
    });

    test('getInternalScheduler should return the internal scheduler instance', () => {
        context.marketsManager.internalScheduler = { some: 'scheduler' };
        const internalScheduler = context.marketsManager.getInternalScheduler();
        expect(internalScheduler).toEqual({ some: 'scheduler' });
    });

    test('getReloadTime should return the internal scheduler reload sleep time', () => {
        context.marketsManager.internalScheduler = {
            getReloadSleepTime: jest.fn().mockReturnValue(10000),
        };

        const reloadTime = context.marketsManager.getReloadTime();

        expect(reloadTime).toEqual(10000);
    });
});
