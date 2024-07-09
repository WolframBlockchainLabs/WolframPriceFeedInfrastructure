import BaseScheduler from '#domain-collectors/infrastructure/schedulers/BaseScheduler.js';
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

describe('[domain-collectors/infrastructure/schedulers]: BaseScheduler Tests', () => {
    const context = {};

    beforeEach(() => {
        jest.useFakeTimers();

        context.setTimeoutStub = jest
            .spyOn(global, 'setTimeout')
            .mockImplementation((cb) => cb());

        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
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
        const setDynamicConfigSpy = jest
            .spyOn(context.baseScheduler, 'setDynamicConfig')
            .mockImplementation(() => {});
        const initializeSchedulerSpy = jest
            .spyOn(context.baseScheduler, 'initializeScheduler')
            .mockImplementation(() => {});

        await context.baseScheduler.start({});

        expect(setDynamicConfigSpy).toHaveBeenCalledTimes(1);
        expect(initializeSchedulerSpy).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(2);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(2);
    });

    test('the "start" method should handle errors and log them', async () => {
        const mockError = new Error('Test Error');

        jest.spyOn(
            context.baseScheduler,
            'setDynamicConfig',
        ).mockImplementation(() => {
            throw mockError;
        });

        await context.baseScheduler.start({});

        expect(context.baseScheduler.logger.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    `${context.baseScheduler.constructor.name} failed to start for:`,
                ),
                context: context.baseScheduler.getLogContext(),
                error: mockError,
            }),
        );
    });

    test('the "stop" method should destroy a schedule, setup a critical section.', async () => {
        const destroyScheduleSpy = jest
            .spyOn(context.baseScheduler, 'destroyScheduler')
            .mockImplementation(() => {});

        await context.baseScheduler.stop();

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(2);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(2);
        expect(destroyScheduleSpy).toHaveBeenCalledTimes(1);
    });

    test('the "stop" method should handle errors and log them', async () => {
        const mockError = new Error('Test Error');

        jest.spyOn(
            context.baseScheduler,
            'destroyScheduler',
        ).mockImplementation(() => {
            throw mockError;
        });

        await context.baseScheduler.stop({});

        expect(context.baseScheduler.logger.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    `${context.baseScheduler.constructor.name} failed to stop for:`,
                ),
                context: context.baseScheduler.getLogContext(),
                error: mockError,
            }),
        );
    });

    test('the "reload" method calls stop and then start method, sets up a critical section', async () => {
        const startSpy = jest
            .spyOn(context.baseScheduler, 'start')
            .mockImplementation(() => {});
        const stopSpy = jest
            .spyOn(context.baseScheduler, 'stop')
            .mockImplementation(() => {});

        await context.baseScheduler.reload({});

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(1);
        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(stopSpy).toHaveBeenCalledTimes(1);
    });

    test('the "reload" method should delay start if shouldSleep option is provided', async () => {
        const startSpy = jest
            .spyOn(context.baseScheduler, 'start')
            .mockImplementation(() => {});
        const stopSpy = jest
            .spyOn(context.baseScheduler, 'stop')
            .mockImplementation(() => {});

        await context.baseScheduler.reload({ shouldSleep: true });

        expect(context.mutexStub.acquire).toHaveBeenCalledTimes(1);
        expect(context.mutexStub.release).toHaveBeenCalledTimes(1);
        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(stopSpy).toHaveBeenCalledTimes(1);
        expect(context.setTimeoutStub).toHaveBeenCalledTimes(1);
    });

    test('the "runOperations" method calls handler', async () => {
        const operations = [jest.fn()];
        context.baseScheduler.operations = operations;

        await context.baseScheduler.runOperations();

        expect(operations[0]).toHaveBeenCalledTimes(1);
    });

    test('the "getOperationDelay" returns desync value for each operation', () => {
        context.baseScheduler.operations = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];
        context.baseScheduler.initializeScheduler();
        const desync = context.baseScheduler.getOperationDelay(1);

        expect(desync).toBe(300);
    });

    test('the "getMultiplierBackoff" returns next multiplier', () => {
        const expectedNewMultiplier = 2;
        const newMultiplier = context.baseScheduler.getMultiplierBackoff();

        expect(newMultiplier).toBe(expectedNewMultiplier);
    });

    test('"setDynamicConfig" should set provided options when config is provided', () => {
        const dynamicConfig = {
            operations: [jest.fn],
            rateLimitMultiplier: 5,
            taskName: 'test',
        };

        context.baseScheduler.setDynamicConfig(dynamicConfig);

        expect(context.baseScheduler.operations).toBe(dynamicConfig.operations);
        expect(context.baseScheduler.rateLimitMultiplier).toBe(
            dynamicConfig.rateLimitMultiplier,
        );
        expect(context.baseScheduler.taskName).toBe(dynamicConfig.taskName);
    });

    test('getRateLimitMultiplier returns the correct rate limit multiplier', () => {
        const rateLimitMultiplier =
            context.baseScheduler.getRateLimitMultiplier();
        expect(rateLimitMultiplier).toBe(
            context.baseScheduler.rateLimitMultiplier,
        );
    });

    test('getInstancePosition returns the correct instance position', () => {
        const instancePosition = context.baseScheduler.getInstancePosition();
        expect(instancePosition).toBe(context.baseScheduler.instancePosition);
    });

    test('getQueueSize returns the correct queue size', () => {
        const queueSize = context.baseScheduler.getQueueSize();
        expect(queueSize).toBe(context.baseScheduler.queueSize);
    });

    test('setQueueSize sets the queue size correctly', () => {
        const newQueueSize = 10;
        context.baseScheduler.setQueueSize(newQueueSize);
        expect(context.baseScheduler.queueSize).toBe(newQueueSize);
    });
});
