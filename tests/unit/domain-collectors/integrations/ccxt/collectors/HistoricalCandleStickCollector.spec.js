import HistoricalCandleStickCollector from '#domain-collectors/integrations/ccxt/collectors/HistoricalCandleStickCollector.js';

describe('[domain-collectors/integrations/ccxt/collectors]: HistoricalCandleStickCollector Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.intervalStart = '2023-01-01T00:00:00Z';
        context.intervalEnd = '2023-01-02T00:00:00Z';

        context.historicalCandleStickCollector =
            new HistoricalCandleStickCollector({});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "formatAggregationInterval" method should format interval correctly', () => {
        const formattedInterval =
            context.historicalCandleStickCollector.formatAggregationInterval({
                intervalStart: context.intervalStart,
                intervalEnd: context.intervalEnd,
            });

        expect(formattedInterval).toEqual({
            intervalStart: context.intervalStart,
            intervalEnd: context.intervalEnd,
        });
    });
});
