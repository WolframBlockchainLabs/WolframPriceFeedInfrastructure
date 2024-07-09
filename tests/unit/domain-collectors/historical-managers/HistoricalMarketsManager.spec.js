import HistoricalMarketsManager from '#domain-collectors/historical-managers/HistoricalMarketsManager.js';

describe('[domain-collectors/historical-managers]: HistoricalMarketsManager Test Suite', () => {
    const context = {};

    beforeEach(() => {
        context.collectorsManagersMock = [
            {
                getSchedulePromise: jest
                    .fn()
                    .mockResolvedValue('schedulePromise1'),
            },
            {
                getSchedulePromise: jest
                    .fn()
                    .mockResolvedValue('schedulePromise2'),
            },
        ];

        context.MarketRepositoryMock = {
            getHistoricalMarketIds: jest
                .fn()
                .mockResolvedValue(['marketId1', 'marketId2']),
        };

        context.historicalMarketsManager = new HistoricalMarketsManager({
            Repositories: {
                MarketRepository: context.MarketRepositoryMock,
            },
        });
        context.historicalMarketsManager.collectorsManagers =
            context.collectorsManagersMock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getSchedulePromise should aggregate promises from all collectorsManagers', async () => {
        const promises =
            await context.historicalMarketsManager.getSchedulePromise();

        for (const mockManager of context.collectorsManagersMock) {
            expect(mockManager.getSchedulePromise).toHaveBeenCalledTimes(1);
        }

        expect(promises).toEqual(['schedulePromise1', 'schedulePromise2']);
    });
});
