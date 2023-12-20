import BaseScheduler from '../../../../../lib/domain-collectors/infrastructure/schedulers/BaseScheduler.js';
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

describe('BaseScheduler Tests', () => {
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

        context.baseScheduler = new BaseScheduler({
            logger: context.loggerStub,
            baseRateLimit: 50,
            rateLimitMargin: 10,
            queuePosition: 3,
            queueSize: 5,
            replicaSize: 2,
            instancePosition: 1,
        });

        context.baseScheduler.startMutex = context.mutexStub;
        context.baseScheduler.stopMutex = context.mutexStub;
        context.baseScheduler.reloadMutex = context.mutexStub;
        context.baseScheduler.updateRTMMutex = context.mutexStub;
        context.baseScheduler.startAssertionMutex = context.mutexStub;
        context.baseScheduler.stopAssertionMutex = context.mutexStub;
        context.baseScheduler.startStopMutex = context.mutexStub;
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('default options are set.', async () => {
        const baseScheduler = new BaseScheduler({
            logger: context.loggerStub,
            baseRateLimit: 50,
            rateLimitMargin: 10,
            queuePosition: 3,
            queueSize: 5,
        });

        expect(baseScheduler.replicaSize).toBe(1);
        expect(baseScheduler.instancePosition).toBe(0);
    });

    test('the "start" method should start initialization, setup a critical section.', async () => {
        const setOperationsSpy = jest
            .spyOn(context.baseScheduler, 'setOperations')
            .mockImplementation(() => {});
        const setMultiplierSpy = jest
            .spyOn(context.baseScheduler, 'setMultiplier')
            .mockImplementation(() => {});
        const initializeSchedulerSpy = jest
            .spyOn(context.baseScheduler, 'initializeScheduler')
            .mockImplementation(() => {});

        await context.baseScheduler.start({});

        expect(setOperationsSpy).toHaveBeenCalledTimes(1);
        expect(setMultiplierSpy).toHaveBeenCalledTimes(1);
        expect(initializeSchedulerSpy).toHaveBeenCalledTimes(1);
    });

    test('the "stop" method should destroy a schedule, setup a critical section.', async () => {
        const destroyScheduleSpy = jest
            .spyOn(context.baseScheduler, 'destroyScheduler')
            .mockImplementation(() => {});

        await context.baseScheduler.stop();

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(3);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(3);
        expect(destroyScheduleSpy).toHaveBeenCalledTimes(1);
    });

    test('the "reload" method calls stop and then start method, sets up a critical section', async () => {
        const startSpy = jest
            .spyOn(context.baseScheduler, 'start')
            .mockImplementation(() => {});
        const stopSpy = jest
            .spyOn(context.baseScheduler, 'stop')
            .mockImplementation(() => {});

        await context.baseScheduler.reload();

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(1);
        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(stopSpy).toHaveBeenCalledTimes(1);
    });

    test('the "reload" method should delay start if a new multiplier is provided', async () => {
        const startSpy = jest
            .spyOn(context.baseScheduler, 'start')
            .mockImplementation(() => {});
        const stopSpy = jest
            .spyOn(context.baseScheduler, 'stop')
            .mockImplementation(() => {});

        await context.baseScheduler.reload(2);

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(1);
        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(stopSpy).toHaveBeenCalledTimes(1);
        expect(context.setTimeoutStub).toHaveBeenCalledTimes(1);
    });

    test('the "updateRateLimitMultiplier" method reloads cron if the new backoff multiplier is valid, and sets up a critical section', async () => {
        const validateMultiplierSpy = jest
            .spyOn(context.baseScheduler, 'validateMultiplier')
            .mockReturnValue(true);
        const reloadSpy = jest
            .spyOn(context.baseScheduler, 'reload')
            .mockImplementation(() => {});

        await context.baseScheduler.updateRateLimitMultiplier();

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(1);
        expect(validateMultiplierSpy).toHaveBeenCalledTimes(1);
        expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    test('the "updateRateLimitMultiplier" method skips reload if the new backoff multiplier is not valid, and sets up a critical section', async () => {
        const validateMultiplierSpy = jest
            .spyOn(context.baseScheduler, 'validateMultiplier')
            .mockReturnValue(false);
        const reloadSpy = jest
            .spyOn(context.baseScheduler, 'reload')
            .mockImplementation(() => {});

        await context.baseScheduler.updateRateLimitMultiplier();

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(1);
        expect(validateMultiplierSpy).toHaveBeenCalledTimes(1);
        expect(reloadSpy).not.toHaveBeenCalled();
    });

    test('the "autoUpdateRateLimitMultiplier" method generates next multiplier and calls updateRateLimitMultiplier', async () => {
        const getMultiplierBackoffSpy = jest
            .spyOn(context.baseScheduler, 'getMultiplierBackoff')
            .mockImplementation(() => {});
        const updateRateLimitMultiplierSpy = jest
            .spyOn(context.baseScheduler, 'updateRateLimitMultiplier')
            .mockImplementation(() => {});

        await context.baseScheduler.autoUpdateRateLimitMultiplier();

        expect(getMultiplierBackoffSpy).toHaveBeenCalledTimes(1);
        expect(updateRateLimitMultiplierSpy).toHaveBeenCalledTimes(1);
    });

    test('the "runOperations" method calls handler', async () => {
        const operations = [jest.fn()];
        context.baseScheduler.setOperations(operations);

        await context.baseScheduler.runOperations();

        expect(operations[0]).toHaveBeenCalledTimes(1);
    });

    test('the "getOperationsBatchDelay" method returns desync value', () => {
        context.baseScheduler.setOperations([
            jest.fn(),
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]);
        context.baseScheduler.initializeScheduler();
        const desync = context.baseScheduler.getOperationsBatchDelay();

        expect(desync).toBe(1440);
    });

    test('the "getOperationDelay" returns desync value for each operation', () => {
        context.baseScheduler.setOperations([
            jest.fn(),
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]);
        context.baseScheduler.initializeScheduler();
        const desync = context.baseScheduler.getOperationDelay(1);

        expect(desync).toBe(300);
    });

    test('the "setOperations" method validates and sets handler', () => {
        const operations = [jest.fn()];
        context.baseScheduler.setOperations(operations);

        expect(context.baseScheduler.operations).toBe(operations);
    });

    test('the "setOperations" throws if handler is not passed', () => {
        expect(() => context.baseScheduler.setOperations()).toThrow();
    });

    test('the "validateMultiplier" returns false if multiplier is invalid', () => {
        context.baseScheduler.setOperations([jest.fn()]);

        const isValid = context.baseScheduler.validateMultiplier(0);

        expect(isValid).toBe(false);
    });

    test('the "validateMultiplier" returns true if multiplier is valid', () => {
        context.baseScheduler.setOperations([jest.fn()]);

        const isValid = context.baseScheduler.validateMultiplier(2);

        expect(isValid).toBe(true);
    });

    test('the "setMultiplier" sets a new multiplier if it is valid', () => {
        const newMultiplier = 2;
        context.baseScheduler.setOperations([jest.fn()]);
        context.baseScheduler.setMultiplier(newMultiplier);

        expect(context.baseScheduler.rateLimitMultiplier).toBe(newMultiplier);
    });

    test('the "setMultiplier" skips if a new multiplier is invalid', () => {
        const newMultiplier = 0;
        context.baseScheduler.setOperations([jest.fn()]);
        context.baseScheduler.setMultiplier(newMultiplier);

        expect(context.baseScheduler.rateLimitMultiplier).not.toBe(
            newMultiplier,
        );
    });

    test('the "getMultiplierBackoff" returns next multiplier', () => {
        const expectedNewMultiplier = 2;
        const newMultiplier = context.baseScheduler.getMultiplierBackoff();

        expect(newMultiplier).toBe(expectedNewMultiplier);
    });

    test('the "getMultiplier" returns current multiplier', () => {
        const multiplier = context.baseScheduler.getMultiplier();

        expect(multiplier).toBe(context.baseScheduler.rateLimitMultiplier);
    });
});
