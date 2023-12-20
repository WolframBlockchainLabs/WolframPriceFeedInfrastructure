import RealtimeScheduler from '../../../../../lib/domain-collectors/infrastructure/schedulers/BaseScheduler.js';
import 'croner';

jest.mock('croner', () => {
    return jest.fn().mockImplementation((_, cb) => {
        cb();

        return {
            previousRun: jest
                .fn()
                .mockReturnValue(new Date('2023-11-7 12:53:44+0000')),
            currentRun: jest
                .fn()
                .mockReturnValue(new Date('2023-11-7 12:54:44+0000')),
        };
    });
});

describe('RealtimeScheduler Tests', () => {
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

        const mutexReleaseStub = jest.fn();

        context.mutexStub = {
            acquire: jest.fn().mockResolvedValue(mutexReleaseStub),
            release: mutexReleaseStub,
        };

        context.realtimeScheduler = new RealtimeScheduler({
            logger: context.loggerStub,
            baseRateLimit: 50,
            rateLimitMargin: 10,
            queuePosition: 3,
            queueSize: 5,
            replicaSize: 2,
            instancePosition: 1,
        });

        context.realtimeScheduler.startMutex = context.mutexStub;
        context.realtimeScheduler.stopMutex = context.mutexStub;
        context.realtimeScheduler.reloadMutex = context.mutexStub;
        context.realtimeScheduler.updateRTMMutex = context.mutexStub;
        context.realtimeScheduler.startAssertionMutex = context.mutexStub;
        context.realtimeScheduler.stopAssertionMutex = context.mutexStub;
        context.realtimeScheduler.startStopMutex = context.mutexStub;
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('the "start" method should start initialization, setup a critical section and wait one cycle.', async () => {
        const setOperationsSpy = jest
            .spyOn(context.realtimeScheduler, 'setOperations')
            .mockImplementation(() => {});
        const setMultiplierSpy = jest
            .spyOn(context.realtimeScheduler, 'setMultiplier')
            .mockImplementation(() => {});
        const initializeSchedulerSpy = jest
            .spyOn(context.realtimeScheduler, 'initializeScheduler')
            .mockImplementation(() => {});
        const waitOneCycleSpy = jest
            .spyOn(context.realtimeScheduler, 'waitOneCycle')
            .mockImplementation(() => {});

        await context.realtimeScheduler.start({});

        expect(setOperationsSpy).toHaveBeenCalledTimes(1);
        expect(setMultiplierSpy).toHaveBeenCalledTimes(1);
        expect(initializeSchedulerSpy).toHaveBeenCalledTimes(1);
        expect(waitOneCycleSpy).toHaveBeenCalledTimes(1);
    });

    test('the "stop" method should stop cron task, setup a critical section and wait one cycle.', async () => {
        const waitOneCycleSpy = jest
            .spyOn(context.realtimeScheduler, 'waitOneCycle')
            .mockImplementation(() => {});
        context.realtimeScheduler.cronTask = { stop: jest.fn() };

        await context.realtimeScheduler.stop();

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(3);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(3);
        expect(waitOneCycleSpy).toHaveBeenCalledTimes(1);
        expect(context.realtimeScheduler.cronTask.stop).toHaveBeenCalledTimes(
            1,
        );
    });

    test('the "reload" method calls stop and then start method, sets up a critical section', async () => {
        const startSpy = jest
            .spyOn(context.realtimeScheduler, 'start')
            .mockImplementation(() => {});
        const stopSpy = jest
            .spyOn(context.realtimeScheduler, 'stop')
            .mockImplementation(() => {});

        await context.realtimeScheduler.reload();

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(1);
        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(stopSpy).toHaveBeenCalledTimes(1);
    });

    test('the "updateRateLimitMultiplier" method reloads cron if the new backoff multiplier is valid, and sets up a critical section', async () => {
        const validateMultiplierSpy = jest
            .spyOn(context.realtimeScheduler, 'validateMultiplier')
            .mockReturnValue(true);
        const reloadSpy = jest
            .spyOn(context.realtimeScheduler, 'reload')
            .mockImplementation(() => {});

        await context.realtimeScheduler.updateRateLimitMultiplier();

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(1);
        expect(validateMultiplierSpy).toHaveBeenCalledTimes(1);
        expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    test('the "updateRateLimitMultiplier" method skips reload if the new backoff multiplier is not valid, and sets up a critical section', async () => {
        const validateMultiplierSpy = jest
            .spyOn(context.realtimeScheduler, 'validateMultiplier')
            .mockReturnValue(false);
        const reloadSpy = jest
            .spyOn(context.realtimeScheduler, 'reload')
            .mockImplementation(() => {});

        await context.realtimeScheduler.updateRateLimitMultiplier();

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(1);
        expect(validateMultiplierSpy).toHaveBeenCalledTimes(1);
        expect(reloadSpy).not.toHaveBeenCalled();
    });

    test('the "autoUpdateRateLimitMultiplier" method generates next multiplier and calls updateRateLimitMultiplier', async () => {
        const getMultiplierBackoffSpy = jest
            .spyOn(context.realtimeScheduler, 'getMultiplierBackoff')
            .mockImplementation(() => {});
        const updateRateLimitMultiplierSpy = jest
            .spyOn(context.realtimeScheduler, 'updateRateLimitMultiplier')
            .mockImplementation(() => {});

        await context.realtimeScheduler.autoUpdateRateLimitMultiplier();

        expect(getMultiplierBackoffSpy).toHaveBeenCalledTimes(1);
        expect(updateRateLimitMultiplierSpy).toHaveBeenCalledTimes(1);
    });

    test('the "runCollectors" method calls handler', async () => {
        const operations = [jest.fn()];
        context.realtimeScheduler.setOperations(operations);

        await context.realtimeScheduler.runCollectors();

        expect(operations[0]).toHaveBeenCalledTimes(1);
    });

    test('the "waitOneCycle" method timeouts execution for one cycle', async () => {
        await context.realtimeScheduler.waitOneCycle();

        expect(context.setTimeoutStub).toHaveBeenCalledTimes(1);
    });

    test('the "waitBetweenBackoffReload" method timeouts execution for multiplier', async () => {
        await context.realtimeScheduler.waitBetweenBackoffReload(2);

        expect(context.setTimeoutStub).toHaveBeenCalledTimes(1);
    });

    test('the "initializeScheduler" method sets up cron scheduler', async () => {
        jest.spyOn(
            context.realtimeScheduler,
            'calculateDesyncTimeoutForCollector',
        ).mockImplementation(() => {});
        jest.spyOn(
            context.realtimeScheduler,
            'runCollectors',
        ).mockImplementation(() => {});
        context.realtimeScheduler.setOperations([
            jest.fn(),
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]);

        await context.realtimeScheduler.initializeScheduler();

        expect(context.realtimeScheduler.intraIntervalDistance).toBe(1440);
        expect(context.realtimeScheduler.normalizedInterval).toBe(1);
        expect(context.realtimeScheduler.interval).toBe('*/1 * * * *');
        expect(
            context.realtimeScheduler.calculateDesyncTimeoutForCollector,
        ).toHaveBeenCalledTimes(1);
        expect(context.realtimeScheduler.runCollectors).toHaveBeenCalledTimes(
            1,
        );
    });

    test('the "calculateDesyncTimeoutForCollector" method returns desync value', () => {
        context.realtimeScheduler.setOperations([
            jest.fn(),
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]);
        context.realtimeScheduler.initializeScheduler();
        const desync =
            context.realtimeScheduler.calculateDesyncTimeoutForCollector();

        expect(desync).toBe(36000);
    });

    test('the "getOperationDesync" returns desync value for each operation', () => {
        context.realtimeScheduler.setOperations([
            jest.fn(),
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]);
        context.realtimeScheduler.initializeScheduler();
        const desync = context.realtimeScheduler.getOperationDesync(1);

        expect(desync).toBe(7500);
    });

    test('the "setOperations" method validates and sets handler', () => {
        const operations = [jest.fn()];
        context.realtimeScheduler.setOperations(operations);

        expect(context.realtimeScheduler.operations).toBe(operations);
    });

    test('the "setOperations" throws if handler is not passed', () => {
        expect(() => context.realtimeScheduler.setOperations()).toThrow();
    });

    test('the "validateMultiplier" returns false if multiplier is invalid', () => {
        context.realtimeScheduler.setOperations([jest.fn()]);

        const isValid = context.realtimeScheduler.validateMultiplier(0);

        expect(isValid).toBe(false);
    });

    test('the "validateMultiplier" returns true if multiplier is valid', () => {
        context.realtimeScheduler.setOperations([jest.fn()]);

        const isValid = context.realtimeScheduler.validateMultiplier(2);

        expect(isValid).toBe(true);
    });

    test('the "setMultiplier" sets a new multiplier if it is valid', () => {
        const newMultiplier = 2;
        context.realtimeScheduler.setOperations([jest.fn()]);
        context.realtimeScheduler.setMultiplier(newMultiplier);

        expect(context.realtimeScheduler.rateLimitMultiplier).toBe(
            newMultiplier,
        );
    });

    test('the "setMultiplier" skips if a new multiplier is invalid', () => {
        const newMultiplier = 0;
        context.realtimeScheduler.setOperations([jest.fn()]);
        context.realtimeScheduler.setMultiplier(newMultiplier);

        expect(context.realtimeScheduler.rateLimitMultiplier).not.toBe(
            newMultiplier,
        );
    });

    test('the "getMultiplierBackoff" returns next multiplier', () => {
        const expectedNewMultiplier = 2;
        const newMultiplier = context.realtimeScheduler.getMultiplierBackoff();

        expect(newMultiplier).toBe(expectedNewMultiplier);
    });

    test('the "getIntervalBounds" returns intervalStart and intervalEnd', () => {
        context.realtimeScheduler.setOperations([jest.fn()]);
        context.realtimeScheduler.initializeScheduler();

        const bounds = context.realtimeScheduler.getIntervalBounds();

        expect(bounds).toEqual({
            intervalStart: new Date('2023-11-7 12:53:44+0000').getTime(),
            intervalEnd: new Date('2023-11-7 12:54:44+0000').getTime(),
        });
    });

    test('the "getMultiplier" returns current multiplier', () => {
        const multiplier = context.realtimeScheduler.getMultiplier();

        expect(multiplier).toBe(context.realtimeScheduler.rateLimitMultiplier);
    });
});
