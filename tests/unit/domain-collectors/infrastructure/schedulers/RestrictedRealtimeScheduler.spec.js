import Cron from 'croner';
import RestrictedRealtimeScheduler from '#domain-collectors/infrastructure/schedulers/RestrictedRealtimeScheduler.js';
import {
    MILLISECONDS_IN_A_SECOND,
    SECONDS_IN_A_MINUTE,
} from '#constants/timeframes.js';
import ScheduleUnitContext from '#domain-collectors/utils/ScheduleUnitContext.js';

jest.mock('croner');
jest.mock('#domain-collectors/utils/ScheduleUnitContext.js');

describe('[domain-collectors/infrastructure/schedulers]: RestrictedRealtimeScheduler Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        jest.useFakeTimers();

        context.setTimeoutStub = jest
            .spyOn(global, 'setTimeout')
            .mockImplementation((cb) => cb());

        context.clearTimeoutStub = jest
            .spyOn(global, 'clearTimeout')
            .mockReturnValue();

        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
        };

        context.operationStub = jest.fn();

        context.clusterMembers = [
            {
                getInterval: jest.fn().mockReturnValue(100),
                isSelf: jest.fn().mockReturnValue(false),
            },
            {
                getInterval: jest.fn().mockReturnValue(200),
                isSelf: jest.fn().mockReturnValue(true),
            },
        ];

        context.scheduler = new RestrictedRealtimeScheduler({
            clusterMembers: context.clusterMembers,
            logger: context.loggerStub,
            queueSize: 5,
            operations: [context.operationStub],
            replicaSize: 2,
            rateLimit: 100,
        });

        context.cronTaskMock = {
            stop: jest.fn(),
            currentRun: jest
                .fn()
                .mockReturnValue(new Date('2023-11-07T12:54:44Z')),
        };
        Cron.mockImplementation((_, cb) => {
            cb();
            return context.cronTaskMock;
        });

        context.scheduleContextMock = {
            unit: SECONDS_IN_A_MINUTE,
            timeUnitDivisor: MILLISECONDS_IN_A_SECOND,
            cronString: '* * * * *',
        };
        ScheduleUnitContext.getContext.mockReturnValue(
            context.scheduleContextMock,
        );

        jest.spyOn(context.scheduler, 'initializeClusterDelay');
        jest.spyOn(context.scheduler, 'initializeBatch');
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('initializeScheduler should set up cron task and initializeClusterDelay', async () => {
        await context.scheduler.initializeScheduler();

        expect(context.scheduler.cronTask).toBeDefined();
        expect(context.scheduler.initializeClusterDelay).toHaveBeenCalled();
    });

    test('destroyScheduler should stop cron task and clear timeouts', async () => {
        await context.scheduler.initializeScheduler();
        await context.scheduler.destroyScheduler();

        expect(context.scheduler.cronTask.stop).toHaveBeenCalled();
        expect(context.clearTimeoutStub).toHaveBeenCalledWith(
            context.scheduler.clusterTimeoutDescriptor,
        );
        expect(context.clearTimeoutStub).toHaveBeenCalledWith(
            context.scheduler.batchTimeoutDescriptor,
        );
    });

    test('setDynamicConfig should call initInterval', () => {
        jest.spyOn(context.scheduler, 'initInterval');
        const dynamicConfig = { someConfig: true };

        context.scheduler.setDynamicConfig(dynamicConfig);

        expect(context.scheduler.initInterval).toHaveBeenCalled();
    });

    test('initInterval should initialize interval context and setup', () => {
        jest.spyOn(context.scheduler, 'setupInterval');
        jest.spyOn(context.scheduler, 'setupIntraIntervalDistance');
        jest.spyOn(context.scheduler, 'getIntervalContext');

        context.scheduler.initInterval();

        expect(context.scheduler.getIntervalContext).toHaveBeenCalled();
        expect(context.scheduler.setupInterval).toHaveBeenCalledWith({
            clusterIntervalInMilliseconds: 300,
            ...context.scheduleContextMock,
        });
        expect(context.scheduler.setupIntraIntervalDistance).toHaveBeenCalled();
    });

    test('setupInterval should calculate correct interval properties', () => {
        const intervalContext = {
            clusterIntervalInMilliseconds: 300,
            unit: SECONDS_IN_A_MINUTE,
            timeUnitDivisor: MILLISECONDS_IN_A_SECOND,
            cronString: '* * * * *',
        };

        context.scheduler.setupInterval(intervalContext);

        expect(context.scheduler.normalizedInterval).toBe(1);
        expect(context.scheduler.preciseNormalizedInterval).toBe(1000);
        expect(context.scheduler.intraClusterDistance).toBe(
            (1000 - 300) / context.clusterMembers.length,
        );
        expect(context.scheduler.interval).toBe('*/1 * * * * *');
    });

    test('setupIntraIntervalDistance should set intraIntervalDistance correctly', () => {
        context.scheduler.intraClusterDistance = 100;

        context.scheduler.setupIntraIntervalDistance();

        expect(context.scheduler.intraIntervalDistance).toBe(
            100 /
                (context.scheduler.queueSize *
                    context.scheduler.operations.length *
                    context.scheduler.replicaSize),
        );
    });

    test('initializeClusterDelay should set timeout for cluster delay', () => {
        context.scheduler.intraClusterDistance = 100;

        context.scheduler.initializeClusterDelay();

        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 250);
        expect(context.scheduler.initializeBatch).toHaveBeenCalled();
    });

    test('initializeBatch should set timeout for batch delay', () => {
        jest.spyOn(
            context.scheduler,
            'getOperationsBatchDelay',
        ).mockReturnValue(200);

        context.scheduler.initializeBatch();

        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
    });

    test('getIntervalBounds should return correct start and end intervals', async () => {
        await context.scheduler.initializeScheduler();

        context.scheduler.initInterval();

        const bounds = context.scheduler.getIntervalBounds();

        expect(bounds).toHaveProperty('intervalStart');
        expect(bounds).toHaveProperty('intervalEnd');
        expect(bounds.intervalEnd - bounds.intervalStart).toBe(
            context.scheduler.preciseNormalizedInterval,
        );
    });

    test('getIntervalSize should return correct interval size', () => {
        const intervalSize = context.scheduler.getIntervalSize();

        expect(intervalSize).toBe(
            context.scheduler.rateLimit *
                context.scheduler.queueSize *
                context.scheduler.operations.length,
        );
    });

    test('getLogContext should return expected context values', async () => {
        await context.scheduler.initializeScheduler();

        context.scheduler.initInterval();

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

    test('getDynamicConfig should return correct dynamic config', () => {
        const dynamicConfig = context.scheduler.getDynamicConfig();

        expect(dynamicConfig).toEqual({
            ...context.scheduler.getDynamicConfig(),
            clusterMembers: context.clusterMembers,
        });
    });

    test('Cron callback should call initializeClusterDelay', async () => {
        await context.scheduler.initializeScheduler();

        expect(context.scheduler.initializeClusterDelay).toHaveBeenCalledTimes(
            1,
        );
    });

    test('getPreciseInterval should return correct interval size', () => {
        const intervalContext = {
            clusterIntervalInMilliseconds: 300,
            unit: SECONDS_IN_A_MINUTE,
            timeUnitDivisor: MILLISECONDS_IN_A_SECOND,
            cronString: '* * * * *',
        };

        context.scheduler.setupInterval(intervalContext);
        const interval = context.scheduler.getPreciseInterval();

        expect(interval).toBe(1000);
    });
});
