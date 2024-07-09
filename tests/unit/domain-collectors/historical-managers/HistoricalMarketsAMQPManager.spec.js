import HistoricalMarketsAMQPManager from '#domain-collectors/historical-managers/HistoricalMarketsAMQPManager.js';

describe('[domain-collectors/historical-managers]: HistoricalMarketsAMQPManager Test Suite', () => {
    const context = {};

    beforeEach(() => {
        context.mockSchedulePromise = Promise.resolve('market scheduled');

        context.marketsManagerMock = {
            getSchedulePromise: jest
                .fn()
                .mockReturnValue(context.mockSchedulePromise),
        };

        context.historicalMarketsAMQPManager = new HistoricalMarketsAMQPManager(
            {
                Repositories: {},
            },
        );
        context.historicalMarketsAMQPManager.marketsManager =
            context.marketsManagerMock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getSchedulePromise should retrieve promise from marketsManager', async () => {
        const schedulePromise =
            context.historicalMarketsAMQPManager.getSchedulePromise();

        expect(
            context.marketsManagerMock.getSchedulePromise,
        ).toHaveBeenCalledTimes(1);
        await expect(schedulePromise).resolves.toBe('market scheduled');
    });
});
