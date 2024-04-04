import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';
import AggregateCandleSticks from '#use-cases/market-records/candle-sticks/Aggregate.js';

describe('[use-cases/market-records/candle-sticks]: AggregateCandleSticks Tests Suite', () => {
    const maxDateDiff = 86400000;

    const context = {};

    beforeAll(() => {
        BaseUseCase.setAppProvider({
            config: { apiLimits: { aggregations: { maxDateDiff } } },
        });
    });

    beforeEach(() => {
        context.CandleStickFindAllStub = jest.fn().mockResolvedValue([]);

        context.CandleStickStub = {
            scope: jest.spyOn(CandleStick, 'scope').mockReturnValue({
                findAll: context.CandleStickFindAllStub,
            }),
        };

        context.aggregateCandleSticks = new AggregateCandleSticks({
            context: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('execute method aggregates data correctly for given symbols', async () => {
        const aggregateDataForSymbolSpy = jest
            .spyOn(context.aggregateCandleSticks, 'aggregateDataForSymbol')
            .mockResolvedValue({
                symbol: 'BTC/USD',
                aggregatedData: {},
                aggregatedRecords: 100,
            });

        const queryParams = {
            symbols: ['BTC/USD'],
            exchangeNames: ['binance'],
            rangeDateStart: '2023-01-01T00:00:00Z',
            rangeDateEnd: '2023-01-02T00:00:00Z',
            limit: 1000,
            offset: 0,
        };
        const result = await context.aggregateCandleSticks.execute(queryParams);

        expect(aggregateDataForSymbolSpy).toHaveBeenCalled();
        expect(result).toEqual({
            data: {
                rangeDateStart: '2023-01-01T00:00:00Z',
                rangeDateEnd: '2023-01-02T00:00:00Z',
                aggregatedPairs: {
                    'BTC/USD': {
                        aggregatedData: {
                            volume: null,
                            aggregatedAveragePrice: null,
                        },
                        aggregatedRecords: 100,
                    },
                },
            },
        });
    });

    describe('aggregateDataForSymbol method', () => {
        test('aggregateDataForSymbol correctly aggregates data for a given symbol', async () => {
            jest.spyOn(
                context.aggregateCandleSticks,
                'fetchCandleSticks',
            ).mockResolvedValue([
                { open: 100, high: 200, low: 50, close: 150, volume: 1000 },
                { open: 150, high: 250, low: 100, close: 200, volume: 2000 },
            ]);
            jest.spyOn(
                context.aggregateCandleSticks,
                'getStepLimit',
            ).mockReturnValue(2);
            jest.spyOn(
                context.aggregateCandleSticks,
                'updateMarketsAggregate',
            ).mockImplementation((aggregate, candleSticks) => {
                aggregate.open['marketId'] = candleSticks[0].open;
                aggregate.high['marketId'] = Math.max(
                    ...candleSticks.map((c) => c.high),
                );
                aggregate.low['marketId'] = Math.min(
                    ...candleSticks.map((c) => c.low),
                );
                aggregate.close['marketId'] =
                    candleSticks[candleSticks.length - 1].close;
                aggregate.volume += candleSticks.reduce(
                    (acc, c) => acc + c.volume,
                    0,
                );
            });
            jest.spyOn(
                context.aggregateCandleSticks,
                'calculateCommonAggregate',
            ).mockReturnValue({
                open: 100,
                high: 250,
                low: 50,
                close: 200,
                volume: 3000,
                aggregatedAveragePrice: 150,
            });

            const symbol = 'BTC/USD';
            const queryParams = { offset: 0, limit: 4 };
            const steps = 2;

            const result =
                await context.aggregateCandleSticks.aggregateDataForSymbol({
                    symbol,
                    queryParams,
                    steps,
                });

            expect(result.symbol).toEqual(symbol);
            expect(result.aggregatedData).toEqual(
                expect.objectContaining({
                    open: 100,
                    high: 250,
                    low: 50,
                    close: 200,
                    volume: 3000,
                    aggregatedAveragePrice: 150,
                }),
            );
            expect(result.aggregatedRecords).toBeGreaterThan(0);
        });

        test('breaks loop if fetched candlesticks are fewer than stepLimit', async () => {
            jest.spyOn(context.aggregateCandleSticks, 'getStepLimit')
                .mockImplementationOnce(() => 10)
                .mockImplementationOnce(() => 10);

            jest.spyOn(context.aggregateCandleSticks, 'fetchCandleSticks')
                .mockResolvedValueOnce(
                    Array(10).fill(['timestamp', 300, 400, 100, 200, 500]),
                )
                .mockResolvedValueOnce(
                    Array(5).fill(['timestamp', 300, 400, 100, 200, 500]),
                );

            jest.spyOn(
                context.aggregateCandleSticks,
                'updateMarketsAggregate',
            ).mockImplementation(() => {});
            jest.spyOn(
                context.aggregateCandleSticks,
                'calculateCommonAggregate',
            ).mockReturnValue({
                open: 100,
                high: 120,
                low: 80,
                close: 110,
                volume: 500,
            });

            const symbol = 'BTC/USD';
            const queryParams = { offset: 0, limit: 20 };
            const steps = 2;

            const result =
                await context.aggregateCandleSticks.aggregateDataForSymbol({
                    symbol,
                    queryParams,
                    steps,
                });

            expect(result).toBeDefined();
            expect(result.aggregatedRecords).toBe(15);
            expect(
                context.aggregateCandleSticks.fetchCandleSticks,
            ).toHaveBeenCalledTimes(2);

            jest.restoreAllMocks();
        });
    });

    test('fetchCandleSticks calls CandleStick model', async () => {
        const findAllMock = jest.fn().mockResolvedValue([
            { open: 100, high: 120, low: 80, close: 110, volume: 500 },
            { open: 110, high: 130, low: 90, close: 120, volume: 600 },
        ]);
        context.CandleStickStub.scope.mockReturnValue({ findAll: findAllMock });

        const queryParams = {
            symbol: 'BTC/USD',
            limit: 2,
            offset: 0,
            orderBy: 'ASC',
        };

        const result =
            await context.aggregateCandleSticks.fetchCandleSticks(queryParams);

        expect(context.CandleStickStub.scope).toHaveBeenCalledWith([
            {
                method: ['search', expect.objectContaining(queryParams)],
            },
        ]);
        expect(findAllMock).toHaveBeenCalled();
        expect(result).toEqual(
            expect.arrayContaining([
                { open: 100, high: 120, low: 80, close: 110, volume: 500 },
                { open: 110, high: 130, low: 90, close: 120, volume: 600 },
            ]),
        );
    });

    test.each([
        {
            step: 0,
            steps: 5,
            limit: 1000,
            expected: AggregateCandleSticks.AGGREGATION_STEP_SIZE,
            description: 'non-last step',
        },
        {
            step: 4,
            steps: 5,
            limit: 1000,
            expected: AggregateCandleSticks.AGGREGATION_STEP_SIZE,
            description: 'last step, limit exactly divisible',
        },
        {
            step: 4,
            steps: 5,
            limit: 1025,
            expected: 25,
            description: 'last step, limit not exactly divisible',
        },
        {
            step: 4,
            steps: 5,
            limit: AggregateCandleSticks.AGGREGATION_STEP_SIZE - 1,
            expected: AggregateCandleSticks.AGGREGATION_STEP_SIZE - 1,
            description: 'last step, limit less than AGGREGATION_STEP_SIZE',
        },
    ])(
        'returns correct stepLimit for $description',
        ({ step, steps, limit, expected }) => {
            const stepLimit = context.aggregateCandleSticks.getStepLimit({
                step,
                steps,
                limit,
            });
            expect(stepLimit).toBe(expected);
        },
    );

    describe('updateMarketsAggregate method', () => {
        test('correctly updates aggregate data from candlestick data', () => {
            const getFirstOpenMock = jest.spyOn(
                context.aggregateCandleSticks,
                'getFirstOpen',
            );
            const getMaxHighMock = jest.spyOn(
                context.aggregateCandleSticks,
                'getMaxHigh',
            );
            const getMinLowMock = jest.spyOn(
                context.aggregateCandleSticks,
                'getMinLow',
            );
            const getLastCloseMock = jest.spyOn(
                context.aggregateCandleSticks,
                'getLastClose',
            );
            const getTotalVolumeMock = jest.spyOn(
                context.aggregateCandleSticks,
                'getTotalVolume',
            );

            const aggregate = {
                open: {},
                high: {},
                low: {},
                close: {},
                volume: 0,
            };

            const data = [
                {
                    charts: [['timestamp', 300, 400, 100, 200, 500]],
                    marketId: 'market1',
                },
                {
                    charts: [['timestamp', 310, 410, 110, 210, 500]],
                    marketId: 'market1',
                },
                {
                    charts: [['timestamp', 320, 420, 120, 220, 500]],
                    marketId: 'market2',
                },
                {
                    charts: [['timestamp', 330, 430, 130, 230, 500]],
                    marketId: 'market2',
                },
            ];

            context.aggregateCandleSticks.updateMarketsAggregate(
                aggregate,
                data,
            );

            expect(aggregate.open).toHaveProperty('market1', 300);
            expect(aggregate.high).toHaveProperty('market1', 410);
            expect(aggregate.low).toHaveProperty('market1', 100);
            expect(aggregate.close).toHaveProperty('market1', 210);

            expect(aggregate.open).toHaveProperty('market2', 320);
            expect(aggregate.high).toHaveProperty('market2', 430);
            expect(aggregate.low).toHaveProperty('market2', 120);
            expect(aggregate.close).toHaveProperty('market2', 230);

            expect(aggregate.volume).toBe(2000);

            expect(getFirstOpenMock).toHaveBeenCalledTimes(data.length);
            expect(getMaxHighMock).toHaveBeenCalledTimes(data.length);
            expect(getMinLowMock).toHaveBeenCalledTimes(data.length);
            expect(getLastCloseMock).toHaveBeenCalledTimes(data.length);
            expect(getTotalVolumeMock).toHaveBeenCalledTimes(data.length);

            jest.restoreAllMocks();
        });

        test('does not update aggregate for empty or missing charts', () => {
            const initialAggregate = {
                open: {},
                high: {},
                low: {},
                close: {},
                volume: 100,
            };

            const aggregateBefore = { ...initialAggregate };

            const dataWithEmptyCharts = [
                {
                    charts: [],
                    marketId: 'market1',
                },
            ];

            context.aggregateCandleSticks.updateMarketsAggregate(
                initialAggregate,
                dataWithEmptyCharts,
            );

            expect(initialAggregate).toEqual(aggregateBefore);

            const dataWithMissingCharts = [
                {
                    marketId: 'market1',
                },
            ];

            context.aggregateCandleSticks.updateMarketsAggregate(
                initialAggregate,
                dataWithMissingCharts,
            );

            expect(initialAggregate).toEqual(aggregateBefore);
        });
    });

    test('calculateCommonAggregate correctly calculates the common aggregate data', () => {
        const calculateMedianMock = jest
            .spyOn(context.aggregateCandleSticks, 'calculateMedian')
            .mockImplementation((numbers) => {
                numbers.sort((a, b) => a - b);
                const mid = Math.floor(numbers.length / 2);
                return numbers.length % 2 !== 0
                    ? numbers[mid]
                    : (numbers[mid - 1] + numbers[mid]) / 2;
            });

        const marketsAggregate = {
            open: { market1: 100, market2: 110, market3: 105 },
            high: { market1: 200, market2: 210, market3: 205 },
            low: { market1: 90, market2: 80, market3: 85 },
            close: { market1: 150, market2: 160, market3: 155 },
            volume: 1000,
        };

        const result =
            context.aggregateCandleSticks.calculateCommonAggregate(
                marketsAggregate,
            );

        expect(result.open).toEqual(105);
        expect(result.high).toEqual(205);
        expect(result.low).toEqual(85);
        expect(result.close).toEqual(155);
        expect(result.volume).toEqual(1000);
        expect(result.aggregatedAveragePrice).toEqual(
            (result.high + result.low) / 2,
        );

        expect(calculateMedianMock).toHaveBeenCalledTimes(4);

        calculateMedianMock.mockRestore();
    });

    describe('calculateMedian method', () => {
        test('returns null for an empty array', () => {
            const result = context.aggregateCandleSticks.calculateMedian([]);
            expect(result).toBeNull();
        });

        test('correctly calculates the median for an array with an odd number of elements', () => {
            const numbersOdd = [3, 1, 2];
            const resultOdd =
                context.aggregateCandleSticks.calculateMedian(numbersOdd);
            expect(resultOdd).toBe(2);
        });

        test('correctly calculates the median for an array with an even number of elements', () => {
            const numbersEven = [1, 2, 3, 4];
            const resultEven =
                context.aggregateCandleSticks.calculateMedian(numbersEven);
            expect(resultEven).toBe(2.5);
        });

        test('handles arrays with non-integer values', () => {
            const numbersNonInteger = [1.5, 2.5, 3.5, 4.5, 5.5];
            const resultNonInteger =
                context.aggregateCandleSticks.calculateMedian(
                    numbersNonInteger,
                );
            expect(resultNonInteger).toBe(3.5);
        });

        test('correctly calculates the median for a large array', () => {
            const largeArray = Array.from({ length: 1001 }, (_, i) => i + 1);
            const resultLarge =
                context.aggregateCandleSticks.calculateMedian(largeArray);
            expect(resultLarge).toBe(501);
        });

        test('returns the correct median for an array with negative numbers', () => {
            const numbersNegative = [-3, -1, -2];
            const resultNegative =
                context.aggregateCandleSticks.calculateMedian(numbersNegative);
            expect(resultNegative).toBe(-2);
        });
    });
});
