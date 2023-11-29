// eslint-disable-next-line import/no-unresolved
import { RateLimitExceeded } from 'ccxt';
import CollectorsManager from '../../../lib/domain-collectors/CollectorsManager.js';
import CandleStickCollector from '../../../lib/domain-collectors/collectors/CandleStickCollector.js';
import Exchange from '../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../lib/domain-model/entities/Market.js';

describe('CollectorsManager Tests', () => {
    const schedulerOptions = {
        baseRateLimit: 50,
        rateLimitMargin: 10,
        operationsAmount: 4,
        queuePosition: 3,
        queueSize: 5,
        replicaSize: 2,
        instancePosition: 1,
    };

    const context = {};

    beforeEach(() => {
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
            schedulerOptions,
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

    test('the "runCollectors" method should handle collector startups and log errors if any.', async () => {
        const mockCollector1 = {
            start: jest.fn().mockResolvedValue(),
            getName: jest.fn().mockReturnValue('Collector1'),
        };
        const mockCollector2 = {
            start: jest.fn().mockRejectedValue(new Error('Test Error')),
            getName: jest.fn().mockReturnValue('Collector2'),
        };

        context.collectorsManager.collectors = [mockCollector1, mockCollector2];
        jest.spyOn(
            context.collectorsManager,
            'startCollectorWithDelay',
        ).mockImplementation((collector) => collector.start());

        await context.collectorsManager.runCollectors();

        expect(
            context.collectorsManager.startCollectorWithDelay,
        ).toHaveBeenCalledWith(mockCollector1, 0);
        expect(
            context.collectorsManager.startCollectorWithDelay,
        ).toHaveBeenCalledWith(mockCollector2, 1);

        expect(mockCollector1.start).toHaveBeenCalled();
        expect(mockCollector2.start).toHaveBeenCalled();
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
    });

    test('the "startCollectorWithDelay" method should delay collector start, then start it, and handle errors.', async () => {
        const mockCollector = {
            start: jest.fn().mockResolvedValue(),
            getName: jest.fn().mockReturnValue('MockCollector'),
            setInterval: jest.fn(),
        };

        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'getOperationDesync',
        ).mockReturnValue(1000);
        jest.spyOn(
            context.collectorsManager.backoffPolicy,
            'broadcastRateLimitChange',
        ).mockResolvedValue();

        await context.collectorsManager.startCollectorWithDelay(
            mockCollector,
            0,
        );

        expect(context.setTimeoutStub).toHaveBeenCalledWith(
            expect.any(Function),
            1000,
        );
        expect(mockCollector.start).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.error).not.toHaveBeenCalled();
        expect(
            context.collectorsManager.backoffPolicy.broadcastRateLimitChange,
        ).not.toHaveBeenCalled();

        mockCollector.start.mockRejectedValue(
            new RateLimitExceeded('Test Error'),
        );
        await context.collectorsManager.startCollectorWithDelay(
            mockCollector,
            0,
        );

        expect(context.setTimeoutStub).toHaveBeenCalledTimes(2);
        expect(mockCollector.start).toHaveBeenCalledTimes(2);
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        expect(
            context.collectorsManager.backoffPolicy.broadcastRateLimitChange,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "startCollectorWithDelay" method should not start backoff policy for unknown errors.', async () => {
        const mockCollector = {
            start: jest.fn().mockResolvedValue(),
            getName: jest.fn().mockReturnValue('MockCollector'),
            setInterval: jest.fn(),
        };

        jest.spyOn(
            context.collectorsManager.collectorsScheduler,
            'getOperationDesync',
        ).mockReturnValue(1000);
        jest.spyOn(
            context.collectorsManager.backoffPolicy,
            'broadcastRateLimitChange',
        ).mockResolvedValue();

        await context.collectorsManager.startCollectorWithDelay(
            mockCollector,
            0,
        );

        expect(context.setTimeoutStub).toHaveBeenCalledWith(
            expect.any(Function),
            1000,
        );
        expect(mockCollector.start).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.error).not.toHaveBeenCalled();
        expect(
            context.collectorsManager.backoffPolicy.broadcastRateLimitChange,
        ).not.toHaveBeenCalled();

        mockCollector.start.mockRejectedValue(new Error('Test Error'));
        await context.collectorsManager.startCollectorWithDelay(
            mockCollector,
            0,
        );

        expect(context.setTimeoutStub).toHaveBeenCalledTimes(2);
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
