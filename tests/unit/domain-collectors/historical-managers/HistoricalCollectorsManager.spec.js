import HistoricalCollectorsManager from '#domain-collectors/historical-managers/HistoricalCollectorsManager.js';

describe('[domain-collectors/historical-managers]: HistoricalCollectorsManager Test Suite', () => {
    const context = {};

    beforeEach(() => {
        context.mockSchedulePromise = Promise.resolve('scheduled');

        context.collectorsSchedulerMock = {
            getSchedulePromise: jest
                .fn()
                .mockReturnValue(context.mockSchedulePromise),
        };

        context.historicalCollectorsManager = new HistoricalCollectorsManager({
            Repositories: {},
        });
        context.historicalCollectorsManager.collectorsScheduler =
            context.collectorsSchedulerMock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getSchedulePromise should retrieve promise from collectorsScheduler', async () => {
        const schedulePromise =
            context.historicalCollectorsManager.getSchedulePromise();

        expect(
            context.collectorsSchedulerMock.getSchedulePromise,
        ).toHaveBeenCalledTimes(1);
        await expect(schedulePromise).resolves.toBe('scheduled');
    });
});
