import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';
import RateLimitExceededException from '#domain-model/exceptions/collectors/RateLimitExceededException.js';
import CollectorsManagerException from '#domain-model/exceptions/collectors/control-plane/CollectorsManagerException.js';

describe('[domain-collectors]: CollectorsManager Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.marketStub = {
            id: 1,
            externalMarketId: 'BTCUSDT',
            symbol: 'BTC/USDT',
            externalExchangeId: 'binance',
            pair: {
                meta: {},
                in: {
                    symbol: 'BTC',
                    meta: {},
                },
                out: {
                    symbol: 'USDT',
                    meta: {},
                },
            },
        };

        context.MarketRepositoryMock = {
            getMarketContext: jest.fn().mockResolvedValue(context.marketStub),
        };

        context.MarketLogRepositoryMock = {
            create: jest.fn().mockResolvedValue({}),
        };

        context.collectorsSchedulerStub = {
            getIntervalBounds: jest.fn(),
            getMultiplierBackoff: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            reload: jest.fn(),
            getMultiplier: jest.fn(),
            setDynamicConfig: jest.fn(),
        };

        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };

        context.amqpClientStub = {
            getChannel: jest.fn().mockReturnValue({
                addSetup: jest.fn(),
            }),
        };

        context.marketEventManagerStub = {
            emit: jest.fn(),
        };

        context.collectorsManager = new CollectorsManager({
            models: [CandleStickCollector],
            logger: context.loggerStub,
            amqpClient: context.amqpClientStub,
            marketId: context.marketStub.id,
            exchangeAPI: {},
            collectorsScheduler: context.collectorsSchedulerStub,
            marketEventManager: context.marketEventManagerStub,
            Repositories: {
                MarketRepository: context.MarketRepositoryMock,
                MarketLogRepository: context.MarketLogRepositoryMock,
            },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "start" method should call necessary methods for setup.', async () => {
        const loadMarketContextSpy = jest
            .spyOn(context.collectorsManager, 'loadMarketContext')
            .mockResolvedValue();
        const connectCollectorsSpy = jest
            .spyOn(context.collectorsManager, 'connectCollectors')
            .mockResolvedValue();
        const startSchedulerSpy = jest
            .spyOn(context.collectorsManager, 'startScheduler')
            .mockResolvedValue();

        await context.collectorsManager.start();

        expect(loadMarketContextSpy).toHaveBeenCalledTimes(1);
        expect(connectCollectorsSpy).toHaveBeenCalledTimes(1);
        expect(startSchedulerSpy).toHaveBeenCalledTimes(1);
    });

    test('the "start" method should wrap errors.', async () => {
        const loadMarketContextSpy = jest
            .spyOn(context.collectorsManager, 'loadMarketContext')
            .mockResolvedValue();
        const connectCollectorsSpy = jest
            .spyOn(context.collectorsManager, 'connectCollectors')
            .mockResolvedValue();
        const startSchedulerSpy = jest
            .spyOn(context.collectorsManager, 'startScheduler')
            .mockRejectedValue();

        await expect(() =>
            context.collectorsManager.start(),
        ).rejects.toBeInstanceOf(CollectorsManagerException);

        expect(loadMarketContextSpy).toHaveBeenCalledTimes(1);
        expect(connectCollectorsSpy).toHaveBeenCalledTimes(1);
        expect(startSchedulerSpy).toHaveBeenCalledTimes(1);
    });

    test('the "stop" method should call stop on the scheduler.', async () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'stop',
        ).mockResolvedValue();

        await context.collectorsManager.stop();

        expect(
            context.collectorsManager.collectorsScheduler.stop,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "stop" method should wrap errors.', async () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'stop',
        ).mockRejectedValue();

        await expect(() =>
            context.collectorsManager.stop(),
        ).rejects.toBeInstanceOf(CollectorsManagerException);

        expect(
            context.collectorsManager.collectorsScheduler.stop,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "reload" method should call stop and start.', async () => {
        jest.spyOn(context.collectorsManager, 'stop').mockResolvedValue();
        jest.spyOn(context.collectorsManager, 'start').mockResolvedValue();

        await context.collectorsManager.reload();

        expect(context.collectorsManager.stop).toHaveBeenCalledTimes(1);
        expect(context.collectorsManager.start).toHaveBeenCalledTimes(1);
    });

    test('the "reload" method should wrap errors.', async () => {
        jest.spyOn(context.collectorsManager, 'stop').mockResolvedValue();
        jest.spyOn(context.collectorsManager, 'start').mockRejectedValue();

        await expect(() =>
            context.collectorsManager.reload(),
        ).rejects.toBeInstanceOf(CollectorsManagerException);

        expect(context.collectorsManager.stop).toHaveBeenCalledTimes(1);
        expect(context.collectorsManager.start).toHaveBeenCalledTimes(1);
    });

    test('the "reloadActive" method should call reload on the scheduler.', async () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'reload',
        ).mockResolvedValue();

        await context.collectorsManager.reloadActive();

        expect(
            context.collectorsManager.collectorsScheduler.reload,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "reloadActive" method should wrap errors.', async () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'reload',
        ).mockRejectedValue();

        await expect(() =>
            context.collectorsManager.reloadActive(),
        ).rejects.toBeInstanceOf(CollectorsManagerException);

        expect(
            context.collectorsManager.collectorsScheduler.reload,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "startCollector" method should start and handle errors.', async () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'getIntervalBounds',
        ).mockReturnValue({
            intervalStart: new Date('2023-11-7 12:53:44+0000').getTime(),
            intervalEnd: new Date('2023-11-7 12:54:44+0000').getTime(),
        });
        const mockCollector = {
            start: jest.fn().mockResolvedValue(),
            getName: jest.fn().mockReturnValue('MockCollector'),
            setInterval: jest.fn(),
        };

        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.error).not.toHaveBeenCalled();
        expect(
            context.collectorsManager.marketEventManager.emit,
        ).not.toHaveBeenCalled();

        mockCollector.start.mockRejectedValue(new RateLimitExceededException());
        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(2);
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        expect(
            context.collectorsManager.marketEventManager.emit,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "startCollector" method should not start backoff policy for unknown errors.', async () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'getIntervalBounds',
        ).mockReturnValue({
            intervalStart: new Date('2023-11-7 12:53:44+0000').getTime(),
            intervalEnd: new Date('2023-11-7 12:54:44+0000').getTime(),
        });
        const mockCollector = {
            start: jest.fn().mockResolvedValue(),
            getName: jest.fn().mockReturnValue('MockCollector'),
            setInterval: jest.fn(),
        };

        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.error).not.toHaveBeenCalled();
        expect(
            context.collectorsManager.marketEventManager.emit,
        ).not.toHaveBeenCalled();

        mockCollector.start.mockRejectedValue(new Error('Test Error'));
        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(2);
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        expect(
            context.collectorsManager.marketEventManager.emit,
        ).toHaveBeenCalledTimes(0);
    });

    test('the "loadMarketContext" method should set symbol and externalExchangeId correctly.', async () => {
        await context.collectorsManager.loadMarketContext();

        expect(context.collectorsManager.market.symbol).toBe('BTC/USDT');
        expect(context.collectorsManager.market.externalExchangeId).toBe(
            'binance',
        );
    });

    test('the "connectCollectors" method should initialize and connect collectors.', async () => {
        class MockCollector {
            constructor({ amqpClient }) {
                this.amqpClient = amqpClient;
            }

            async initAMQPConnection() {}
        }

        context.collectorsManager.models = [MockCollector];

        jest.spyOn(
            MockCollector.prototype,
            'initAMQPConnection',
        ).mockResolvedValue();

        await context.collectorsManager.connectCollectors();

        expect(context.collectorsManager.collectors.length).toBe(1);
        expect(context.collectorsManager.collectors[0]).toBeInstanceOf(
            MockCollector,
        );
        expect(
            MockCollector.prototype.initAMQPConnection,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "startScheduler" method should start the scheduler with the correct handler.', async () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'start',
        ).mockResolvedValue();

        await context.collectorsManager.startScheduler();

        expect(
            context.collectorsManager.collectorsScheduler.start,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "initCollectors" method should initialize collector instances from models.', () => {
        class MockCollector {
            constructor(config) {
                this.config = config;
            }
        }

        context.collectorsManager.models = [MockCollector];

        context.collectorsManager.initCollectors();

        expect(context.collectorsManager.collectors.length).toBe(1);
        expect(context.collectorsManager.collectors[0]).toBeInstanceOf(
            MockCollector,
        );
    });

    test('the "setDynamicConfig" method should call setDynamicConfig on the scheduler.', () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'setDynamicConfig',
        ).mockResolvedValue();

        context.collectorsManager.setDynamicConfig({});

        expect(
            context.collectorsManager.collectorsScheduler.setDynamicConfig,
        ).toHaveBeenCalledTimes(1);
    });

    test('should start the scheduler with correct parameters', async () => {
        const spyStartCollector = jest
            .spyOn(context.collectorsManager, 'startCollector')
            .mockImplementation();
        const spyStart = jest
            .spyOn(context.collectorsManager.collectorsScheduler, 'start')
            .mockImplementation(({ operations }) =>
                operations.forEach((operation) => operation()),
            );

        context.collectorsManager.collectors = [{}, {}];

        await context.collectorsManager.startScheduler();

        expect(spyStart).toHaveBeenCalledTimes(1);
        expect(spyStartCollector).toHaveBeenCalledTimes(
            context.collectorsManager.collectors.length,
        );
    });

    test('the "getMarketId" method should return marketId.', () => {
        const marketId = context.collectorsManager.getMarketId();

        expect(marketId).toBe(context.collectorsManager.marketId);
    });
});
