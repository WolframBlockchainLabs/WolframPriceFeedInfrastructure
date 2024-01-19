import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';
import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

describe('CollectorsManager Tests', () => {
    const context = {};

    beforeEach(() => {
        context.collectorsSchedulerStub = {
            getIntervalBounds: jest.fn(),
            getMultiplierBackoff: jest.fn(),
            start: jest.fn(),
            autoUpdateRateLimitMultiplier: jest.fn(),
            reload: jest.fn(),
            getMultiplier: jest.fn(),
        };

        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
        };

        context.amqpClientStub = {
            getChannel: jest.fn().mockReturnValue({
                addSetup: jest.fn(),
            }),
        };

        context.marketsManagerStub = {
            broadcastRateLimitChange: jest.fn(),
        };

        context.setTimeoutStub = jest
            .spyOn(global, 'setTimeout')
            .mockImplementation((cb) => cb());

        context.collectorsManager = new CollectorsManager({
            models: [CandleStickCollector],
            logger: context.loggerStub,
            amqpClient: context.amqpClientStub,
            exchange: 'binance',
            symbol: 'BTC/USDT',
            exchangeAPI: {},
            collectorsScheduler: context.collectorsSchedulerStub,
            marketsManager: context.marketsManagerStub,
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
            context.collectorsManager.marketsManager.broadcastRateLimitChange,
        ).not.toHaveBeenCalled();

        mockCollector.start.mockRejectedValue(new RateLimitExceededException());
        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(2);
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        expect(
            context.collectorsManager.marketsManager.broadcastRateLimitChange,
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
            context.collectorsManager.marketsManager.broadcastRateLimitChange,
        ).not.toHaveBeenCalled();

        mockCollector.start.mockRejectedValue(new Error('Test Error'));
        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(2);
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        expect(
            context.collectorsManager.marketsManager.broadcastRateLimitChange,
        ).toHaveBeenCalledTimes(0);
    });

    test('the "loadMarketContext" method should set the marketId correctly.', async () => {
        const mockExchange = { id: 1, externalExchangeId: 'binance' };
        const mockMarket = { id: 2, exchangeId: 1, symbol: 'BTC/USDT' };

        jest.spyOn(Exchange, 'findOneOrFail').mockResolvedValue(mockExchange);
        jest.spyOn(Market, 'findOneOrFail').mockResolvedValue(mockMarket);

        await context.collectorsManager.loadMarketContext();

        expect(context.collectorsManager.marketId).toBe(mockMarket.id);
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

    test('the "reloadScheduler" method should call reload on the scheduler.', () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'reload',
        ).mockResolvedValue();

        context.collectorsManager.reloadScheduler();

        expect(
            context.collectorsManager.collectorsScheduler.reload,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "getRateLimitMultiplier" method should call getMultiplier on the scheduler.', () => {
        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'getMultiplier',
        ).mockResolvedValue();

        context.collectorsManager.getRateLimitMultiplier();

        expect(
            context.collectorsManager.collectorsScheduler.getMultiplier,
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
});
