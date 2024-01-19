import 'croner';
import StableRealtimeScheduler from '#domain-collectors/infrastructure/schedulers/StableRealtimeScheduler.js';

jest.mock('croner', () => {
    return jest.fn().mockImplementation((_, cb) => {
        cb();

        return {
            stop: jest.fn(),
            currentRun: jest
                .fn()
                .mockReturnValue(new Date('2023-11-7 12:54:44+0000')),
        };
    });
});

describe('[Scheduler]: StableRealtimeScheduler Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        jest.useFakeTimers();

        context.setTimeoutStub = jest
            .spyOn(global, 'setTimeout')
            .mockImplementation((cb) => cb());

        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
        };

        context.operationStub = jest.fn();

        context.scheduler = new StableRealtimeScheduler({
            logger: context.loggerStub,
            baseRateLimit: 50,
            rateLimitMargin: 10,
            queuePosition: 3,
            queueSize: 5,
            replicaSize: 2,
            instancePosition: 1,
        });

        context.scheduler.operations = [context.operationStub];
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('initializeScheduler should set up cron task and batchTimeoutDescriptor', async () => {
        await context.scheduler.initializeScheduler();

        expect(context.scheduler.cronTask).toBeDefined();
        expect(context.scheduler.batchTimeoutDescriptor).toBeDefined();
    });

    test('destroyScheduler should stop cron task and call super method', async () => {
        await context.scheduler.initializeScheduler();
        await context.scheduler.destroyScheduler();

        expect(context.scheduler.cronTask.stop).toHaveBeenCalledTimes(1);
    });

    test('setupInterval should calculate correct interval for minute precision', () => {
        context.scheduler.baseRateLimit = 20000;

        context.scheduler.setupInterval();

        expect(context.scheduler.normalizedInterval).toBeGreaterThan(0);
        expect(context.scheduler.interval).toMatch(/\/\d+ \* \* \* \*/);
    });

    test('setupInterval should calculate correct interval for second precision', () => {
        context.scheduler.setupInterval();

        expect(context.scheduler.normalizedInterval).toBeGreaterThan(0);
        expect(context.scheduler.interval).toMatch(/\/\d+ \* \* \* \* \*/);
    });

    test('getLogContext should return expected context values', async () => {
        await context.scheduler.initializeScheduler();

        const logContext = context.scheduler.getLogContext();

        expect(logContext).toEqual(
            expect.objectContaining({
                interval: expect.any(String),
                intraIntervalDistance: expect.any(Number),
                normalizedInterval: expect.any(Number),
                preciseNormalizedInterval: expect.any(Number),
            }),
        );
    });

    test('getIntervalBounds should return correct start and end intervals', async () => {
        await context.scheduler.initializeScheduler();

        const bounds = context.scheduler.getIntervalBounds();

        expect(bounds).toHaveProperty('intervalStart');
        expect(bounds).toHaveProperty('intervalEnd');
        expect(bounds.intervalEnd - bounds.intervalStart).toBe(
            context.scheduler.preciseNormalizedInterval,
        );
    });
});
