// eslint-disable-next-line import/no-unresolved
import HistoricalScheduler from '../../../../../lib/domain-collectors/infrastructure/schedulers/HistoricalScheduler.js';

describe('[domain-collectors/infrastructure/schedulers]: HistoricalScheduler Tests Suite', () => {
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

        context.historicalScheduler = new HistoricalScheduler({
            logger: context.loggerStub,
            scheduleStartDate,
            scheduleEndDate,
            baseRateLimit: 50,
            rateLimitMargin: 10,
            operationsAmount: 4,
            queuePosition: 3,
            queueSize: 5,
            replicaSize: 2,
            instancePosition: 1,
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('the "start" method should call parent start and handleStop', async () => {
        const startSpy = jest
            .spyOn(
                Object.getPrototypeOf(HistoricalScheduler.prototype),
                'start',
            )
            .mockImplementation(() => {});
        const handleStopSpy = jest
            .spyOn(context.historicalScheduler, 'handleStop')
            .mockImplementation(() => {});

        await context.historicalScheduler.start({});

        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(handleStopSpy).toHaveBeenCalledTimes(1);
    });

    test('the "runCollectors" method updates intervalBounds and calls handler', async () => {
        const operation = jest.fn();

        const updateIntervalBoundsSpy = jest
            .spyOn(context.historicalScheduler, 'updateIntervalBounds')
            .mockImplementation(() => {});
        context.historicalScheduler.setOperations([operation]);

        await context.historicalScheduler.runCollectors();

        expect(updateIntervalBoundsSpy).toHaveBeenCalledTimes(1);
        expect(operation).toHaveBeenCalledTimes(1);
    });

    test('the "updateIntervalBounds" should update scheduler state.', () => {
        context.historicalScheduler.updateIntervalBounds();
        expect(context.historicalScheduler.cycleCounter).toBe(1);

        context.historicalScheduler.updateIntervalBounds();
        expect(context.historicalScheduler.cycleCounter).toBe(2);

        context.historicalScheduler.updateIntervalBounds();
        expect(context.historicalScheduler.cycleCounter).toBe(3);
    });

    test('the "handleStop" method should call stop method after all cycle are completed.', async () => {
        const stopSpy = jest
            .spyOn(context.historicalScheduler, 'stop')
            .mockImplementation(() => {});

        await context.historicalScheduler.handleStop();

        expect(stopSpy).toHaveBeenCalledTimes(1);
        expect(context.setTimeoutStub).toHaveBeenCalledTimes(1);
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

    test('updateIntervalBounds should handle normal cycle correctly', () => {
        context.historicalScheduler.cycleCounter = 0;
        context.historicalScheduler.totalCycles = 2;
        context.historicalScheduler.operationLimit = 60;
        context.historicalScheduler.collectionStartDate = new Date(
            '2023-01-01T00:00:00Z',
        );

        context.historicalScheduler.updateIntervalBounds();

        expect(context.historicalScheduler.cycleCounter).toBe(1);
    });

    test('updateIntervalBounds should handle final cycle correctly', () => {
        context.historicalScheduler.cycleCounter = 1;
        context.historicalScheduler.totalCycles = 2;
        context.historicalScheduler.lastCycleLimit = 30;
        context.historicalScheduler.collectionStartDate = new Date(
            '2023-01-01T00:00:00Z',
        );

        context.historicalScheduler.updateIntervalBounds();

        expect(context.historicalScheduler.cycleCounter).toBe(2);
    });

    test('the "getIntervalBounds" returns intervalStart and intervalEnd', () => {
        const bounds = context.historicalScheduler.getIntervalBounds();

        expect(bounds).toEqual({
            intervalStart: context.historicalScheduler.intervalStart,
            intervalEnd: context.historicalScheduler.intervalEnd,
        });
    });
});
