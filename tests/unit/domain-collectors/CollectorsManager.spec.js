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
            updateRateLimitMultiplier: jest.fn(),
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
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('constructor should initialize scheduler, backoff manager, and properties.', () => {
        expect(context.collectorsManager.collectorsScheduler).toBeTruthy();
        expect(context.collectorsManager.backoffPolicy).toBeTruthy();
    });

    test('the "start" method should call necessary methods for setup.', async () => {
        const loadMarketContextSpy = jest
            .spyOn(context.collectorsManager, 'loadMarketContext')
            .mockResolvedValue();
        const connectCollectorsSpy = jest
            .spyOn(context.collectorsManager, 'connectCollectors')
            .mockResolvedValue();
        const startBackoffPolicySpy = jest
            .spyOn(context.collectorsManager, 'startBackoffPolicy')
            .mockResolvedValue();
        const startStatusUpdatePolicySpy = jest
            .spyOn(context.collectorsManager, 'startStatusUpdatePolicy')
            .mockResolvedValue();
        const startSchedulerSpy = jest
            .spyOn(context.collectorsManager, 'startScheduler')
            .mockResolvedValue();

        await context.collectorsManager.start();

        expect(loadMarketContextSpy).toHaveBeenCalledTimes(1);
        expect(connectCollectorsSpy).toHaveBeenCalledTimes(1);
        expect(startBackoffPolicySpy).toHaveBeenCalledTimes(1);
        expect(startStatusUpdatePolicySpy).toHaveBeenCalledTimes(1);
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

        jest.spyOn(
            context.collectorsManager.backoffPolicy,
            'broadcastRateLimitChange',
        ).mockResolvedValue();

        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.error).not.toHaveBeenCalled();
        expect(
            context.collectorsManager.backoffPolicy.broadcastRateLimitChange,
        ).not.toHaveBeenCalled();

        mockCollector.start.mockRejectedValue(new RateLimitExceededException());
        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(2);
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        expect(
            context.collectorsManager.backoffPolicy.broadcastRateLimitChange,
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

        jest.spyOn(
            context.collectorsManager.backoffPolicy,
            'broadcastRateLimitChange',
        ).mockResolvedValue();

        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.error).not.toHaveBeenCalled();
        expect(
            context.collectorsManager.backoffPolicy.broadcastRateLimitChange,
        ).not.toHaveBeenCalled();

        mockCollector.start.mockRejectedValue(new Error('Test Error'));
        await context.collectorsManager.startCollector(mockCollector, 0);

        expect(mockCollector.start).toHaveBeenCalledTimes(2);
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        expect(
            context.collectorsManager.backoffPolicy.broadcastRateLimitChange,
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

    test('the "startBackoffPolicy" method should start the backoff manager with the correct handler.', async () => {
        jest.spyOn(
            context.collectorsManager.backoffPolicy,
            'start',
        ).mockResolvedValue();

        await context.collectorsManager.startBackoffPolicy();

        expect(
            context.collectorsManager.backoffPolicy.start,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "startStatusUpdatePolicy" method should start the status update policy with the correct handlers.', async () => {
        jest.spyOn(
            context.collectorsManager.statusUpdatePolicy,
            'start',
        ).mockResolvedValue();

        await context.collectorsManager.startStatusUpdatePolicy();

        expect(
            context.collectorsManager.statusUpdatePolicy.start,
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
});
