import RestrictedHistoricalScheduler from '#domain-collectors/infrastructure/schedulers/RestrictedHistoricalScheduler.js';

describe('[domain-collectors/infrastructure/schedulers]: RestrictedHistoricalScheduler Tests Suite', () => {
    const scheduleStartDate = new Date('2023-11-7 12:53:44+0000');
    const scheduleEndDate = new Date('2023-11-10 12:53:44+0000');

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

        context.historicalScheduler = new RestrictedHistoricalScheduler({
            logger: context.loggerStub,
            scheduleStartDate,
            scheduleEndDate,
            baseRateLimit: 50,
            rateLimitMargin: 10,
            queuePosition: 3,
            queueSize: 5,
            replicaSize: 2,
            instancePosition: 1,
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('the "start" method should call parent start', async () => {
        const estimateDurationTimeSpy = jest
            .spyOn(context.historicalScheduler, 'estimateDurationTime')
            .mockImplementation(() => {});
        const startSpy = jest
            .spyOn(
                Object.getPrototypeOf(RestrictedHistoricalScheduler.prototype),
                'start',
            )
            .mockImplementation(() => {});

        await context.historicalScheduler.start({});

        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(estimateDurationTimeSpy).toHaveBeenCalledTimes(1);
    });

    test('the "handleReloadSleep" method should call parent handleReloadSleep and handle cycles backoff', async () => {
        const backoffCyclesSpy = jest
            .spyOn(context.historicalScheduler, 'backoffCycles')
            .mockImplementation(() => {});
        const handleReloadSleepSpy = jest
            .spyOn(
                Object.getPrototypeOf(RestrictedHistoricalScheduler.prototype),
                'handleReloadSleep',
            )
            .mockImplementation(() => {});

        await context.historicalScheduler.handleReloadSleep({});

        expect(handleReloadSleepSpy).toHaveBeenCalledTimes(1);
        expect(backoffCyclesSpy).toHaveBeenCalledTimes(1);
    });

    test('estimateDurationTime should accurately calculate the estimated completion time', () => {
        jest.spyOn(global.Date, 'now').mockImplementation(() =>
            new Date('2023-11-7 12:53:44+0000').getTime(),
        );

        const preciseNormalizedInterval = 1000 * 60 * 60;
        context.historicalScheduler.totalCycles = 4;
        context.historicalScheduler.cycleCounter = 1;
        context.historicalScheduler.preciseNormalizedInterval =
            preciseNormalizedInterval;

        const estimatedCompletionTime =
            context.historicalScheduler.estimateDurationTime();
        const expectedDurationMs =
            (context.historicalScheduler.totalCycles +
                1 -
                context.historicalScheduler.cycleCounter) *
            preciseNormalizedInterval;
        const expectedCompletionTime = new Date(
            Date.now() + expectedDurationMs,
        ).toISOString();

        expect(estimatedCompletionTime).toBe(expectedCompletionTime);
    });

    test('backoffCycles method should correctly back off cycles', () => {
        context.historicalScheduler.cycleCounter = 5;
        context.historicalScheduler.reloadCyclesBackoff = 3;

        context.historicalScheduler.backoffCycles();

        expect(context.historicalScheduler.cycleCounter).toBe(2);

        context.historicalScheduler.cycleCounter = 2;
        context.historicalScheduler.reloadCyclesBackoff = 3;

        context.historicalScheduler.backoffCycles();

        expect(context.historicalScheduler.cycleCounter).toBe(0);
    });

    test('the "runOperations" method updates intervalBounds and calls handler', async () => {
        const operation = jest.fn();

        const updateIntervalBoundsSpy = jest
            .spyOn(context.historicalScheduler, 'updateIntervalBounds')
            .mockImplementation(() => false);
        context.historicalScheduler.operations = [operation];

        await context.historicalScheduler.runOperations();

        expect(updateIntervalBoundsSpy).toHaveBeenCalledTimes(1);
        expect(operation).toHaveBeenCalledTimes(1);
    });

    test('the "runOperations" method stops execution on the last cycle', async () => {
        const operation = jest.fn();

        context.historicalScheduler.cronTask = { stop: jest.fn() };
        context.historicalScheduler.cycleCounter =
            context.historicalScheduler.totalCycles;

        const updateIntervalBoundsSpy = jest
            .spyOn(context.historicalScheduler, 'updateIntervalBounds')
            .mockImplementation(() => true);
        context.historicalScheduler.operations = [operation];

        await context.historicalScheduler.runOperations();

        expect(context.historicalScheduler.cronTask.stop).toHaveBeenCalledTimes(
            1,
        );
        expect(updateIntervalBoundsSpy).toHaveBeenCalledTimes(1);
        expect(operation).toHaveBeenCalledTimes(1);
    });

    test('calculateLastCycleLimit should return remainingMinutes if it is not falsy', () => {
        context.historicalScheduler.collectionStartDate = new Date(
            '2023-01-01T00:00:00Z',
        );
        context.historicalScheduler.collectionEndDate = new Date(
            '2023-01-01T01:00:00Z',
        );
        context.historicalScheduler.operationLimit = 60;

        const expectedRemainingMinutes = 60;
        const result = context.historicalScheduler.calculateLastCycleLimit();

        expect(result).toBe(expectedRemainingMinutes);
    });

    test('calculateLastCycleLimit should return operationLimit if remainingMinutes is 0', () => {
        context.historicalScheduler.collectionStartDate = new Date(
            '2023-01-01T00:00:00Z',
        );
        context.historicalScheduler.collectionEndDate = new Date(
            '2023-01-01T00:00:00Z',
        );
        context.historicalScheduler.operationLimit = 60;

        const result = context.historicalScheduler.calculateLastCycleLimit();

        expect(result).toBe(context.historicalScheduler.operationLimit);
    });

    test('updateIntervalBounds should set intervalStart and intervalEnd', () => {
        context.historicalScheduler.cycleCounter = 0;
        context.historicalScheduler.totalCycles = 2;
        context.historicalScheduler.operationLimit = 60;
        context.historicalScheduler.collectionStartDate = new Date(
            '2023-01-01T00:00:00Z',
        ).getTime();

        context.historicalScheduler.updateIntervalBounds();

        expect(context.historicalScheduler.intervalStart).toBe(1672531200000);
        expect(context.historicalScheduler.intervalEnd).toBe(1672534800000);
    });

    test('updateIntervalBounds should handle final cycle precisely', () => {
        context.historicalScheduler.cycleCounter = 1;
        context.historicalScheduler.totalCycles = 2;
        context.historicalScheduler.lastCycleLimit = 30;
        context.historicalScheduler.collectionStartDate = new Date(
            '2023-01-01T00:00:00Z',
        ).getTime();

        context.historicalScheduler.updateIntervalBounds();

        expect(context.historicalScheduler.intervalStart).toBe(1672561200000);
        expect(context.historicalScheduler.intervalEnd).toBe(1672563000000);
    });

    test('updateIntervalBounds method should return true and not modify interval bounds when cycleCounter >= totalCycles', () => {
        context.historicalScheduler.cycleCounter = 5;
        context.historicalScheduler.totalCycles = 5;

        context.historicalScheduler.collectionStartDate = new Date(
            '2023-01-01T00:00:00Z',
        ).getTime();

        const initialIntervalStart =
            (context.historicalScheduler.intervalStart = 0);
        const initialIntervalEnd =
            (context.historicalScheduler.intervalEnd = 0);

        const result = context.historicalScheduler.updateIntervalBounds();

        expect(result).toBe(true);
        expect(context.historicalScheduler.intervalStart).toBe(
            initialIntervalStart,
        );
        expect(context.historicalScheduler.intervalEnd).toBe(
            initialIntervalEnd,
        );
        expect(context.historicalScheduler.cycleCounter).toBe(5);
    });

    test('the "getIntervalBounds" returns intervalStart and intervalEnd', () => {
        const bounds = context.historicalScheduler.getIntervalBounds();

        expect(bounds).toEqual({
            intervalStart: context.historicalScheduler.intervalStart,
            intervalEnd: context.historicalScheduler.intervalEnd,
        });
    });

    test('the "getSchedulePromise" returns scheduler execution promise', () => {
        const promise = context.historicalScheduler.getSchedulePromise();

        expect(promise).toEqual(context.historicalScheduler.schedulePromise);
    });
});
