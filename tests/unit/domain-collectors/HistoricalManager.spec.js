import HistoricalManager from '#domain-collectors/HistoricalManager.js';
import HistoricalScheduler from '#domain-collectors/infrastructure/schedulers/HistoricalScheduler.js';
import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';

describe('[domain-collectors]: HistoricalManager Tests Suite', () => {
    const context = {};

    const schedulerOptions = {
        baseRateLimit: 50,
        rateLimitMargin: 10,
        operationsAmount: 4,
        queuePosition: 3,
        queueSize: 5,
        replicaSize: 2,
        instancePosition: 1,
        scheduleStartDate: '2023-08-04 07:40:00+0000',
        scheduleEndDate: '2023-08-04 07:45:00+0000',
    };

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

        context.historicalManager = new HistoricalManager({
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

    test('the "initScheduler" method should initialize a HistoricalScheduler with correct options', async () => {
        context.historicalManager.initScheduler(schedulerOptions);

        expect(context.historicalManager.collectorsScheduler).toBeInstanceOf(
            HistoricalScheduler,
        );
    });
});
