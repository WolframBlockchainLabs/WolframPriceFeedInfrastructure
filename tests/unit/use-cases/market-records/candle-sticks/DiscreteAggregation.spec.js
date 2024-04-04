import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';
import DiscreteAggregation from '#use-cases/market-records/candle-sticks/DiscreteAggregation.js';

describe('[use-cases/market-records/candle-sticks]: DiscreteAggregation Tests Suite', () => {
    const maxDateDiff = 86400000;
    const stepSize = 1000;

    const context = {};

    beforeAll(() => {
        BaseUseCase.setAppProvider({
            config: { apiLimits: { aggregations: { maxDateDiff, stepSize } } },
        });
    });

    beforeEach(() => {
        context.CandleStickFindAllStub = jest.fn().mockResolvedValue([]);

        context.CandleStickStub = {
            scope: jest.spyOn(CandleStick, 'scope').mockReturnValue({
                findAll: context.CandleStickFindAllStub,
            }),
        };

        context.aggregateCandleSticks = new DiscreteAggregation({
            context: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('execute method', () => {
        test('aggregates data correctly for given symbols and exchange names', async () => {
            const aggregateCandleSticksForSymbolMock = jest
                .spyOn(
                    context.aggregateCandleSticks,
                    'aggregateCandleSticksForSymbol',
                )
                .mockResolvedValueOnce({
                    symbol: 'BTC/USD',
                    processedCount: 10,
                    count: 5,
                    candles: [{}],
                })
                .mockResolvedValueOnce({
                    symbol: 'ETH/USD',
                    processedCount: 8,
                    count: 4,
                    candles: [{}],
                });

            const symbols = ['BTC/USD', 'ETH/USD'];
            const exchangeNames = ['binance'];
            const rangeDateStart = '2023-01-01T00:00:00Z';
            const rangeDateEnd = '2023-01-02T00:00:00Z';
            const timeframeMinutes = 60;

            const result = await context.aggregateCandleSticks.execute({
                symbols,
                exchangeNames,
                rangeDateStart,
                rangeDateEnd,
                timeframeMinutes,
            });

            expect(aggregateCandleSticksForSymbolMock).toHaveBeenCalledTimes(
                symbols.length,
            );
            expect(result).toHaveProperty('data');
            expect(result.data).toEqual(
                expect.objectContaining({
                    timeframeMinutes,
                    rangeDateStart,
                    rangeDateEnd,
                    exchangeNames,
                    pairs: expect.arrayContaining([
                        expect.objectContaining({ symbol: 'BTC/USD' }),
                        expect.objectContaining({ symbol: 'ETH/USD' }),
                    ]),
                }),
            );
        });
    });

    describe('aggregateCandleSticksForSymbol method', () => {
        test('correctly aggregates candlestick data for a symbol across multiple batches', async () => {
            const mockFetchAndProcessBatch = jest
                .spyOn(context.aggregateCandleSticks, 'fetchAndProcessBatch')
                .mockResolvedValueOnce({
                    isLastBatch: false,
                    processedCount: 100,
                    lastTimeframeStart: new Date(
                        '2023-01-01T02:00:00Z',
                    ).getTime(),
                    unfinishedTimeframe: null,
                    aggregatedTimeframes: [{}],
                })
                .mockResolvedValueOnce({
                    isLastBatch: true,
                    processedCount: 50,
                    lastTimeframeStart: new Date(
                        '2023-01-01T03:00:00Z',
                    ).getTime(),
                    unfinishedTimeframe: {},
                    aggregatedTimeframes: [{}],
                });

            const result =
                await context.aggregateCandleSticks.aggregateCandleSticksForSymbol(
                    {
                        symbol: 'BTC/USD',
                        rangeDateStart: '2023-01-01T00:00:00Z',
                        rangeDateEnd: '2023-01-02T00:00:00Z',
                        timeframeDurationMs: 60000 * 60,
                        exchangeNames: ['binance'],
                    },
                );

            expect(result).toHaveProperty('symbol', 'BTC/USD');
            expect(result.processedCount).toBe(150);
            expect(result.candles.length).toBeGreaterThan(0);
            expect(mockFetchAndProcessBatch).toHaveBeenCalledTimes(2);
        });

        test('should push transitionTimeframe into aggregatedData if it exists', async () => {
            const transitionTimeframe = {};
            const fetchAndProcessBatchResult = {
                isLastBatch: true,
                processedCount: 10,
                lastTimeframeStart: 1649996400000,
                unfinishedTimeframe: transitionTimeframe,
                aggregatedTimeframes: [{}, {}, {}],
            };

            const fetchAndProcessBatchMock = jest
                .spyOn(context.aggregateCandleSticks, 'fetchAndProcessBatch')
                .mockResolvedValue(fetchAndProcessBatchResult);

            const result =
                await context.aggregateCandleSticks.aggregateCandleSticksForSymbol(
                    {
                        symbol: 'BTC/USDT',
                        rangeDateStart: '2024-04-01 00:00:00',
                        rangeDateEnd: '2024-04-02 00:00:00',
                        timeframeDurationMs: 60000,
                        exchangeNames: ['Binance', 'Bybit', 'OKX'],
                    },
                );

            expect(fetchAndProcessBatchMock).toHaveBeenCalledTimes(1);
            expect(result.candles).toContain(transitionTimeframe);
        });

        test('should skip transitionTimeframe if it was not provided', async () => {
            const transitionTimeframe = {};
            const fetchAndProcessBatchResult = {
                isLastBatch: true,
                processedCount: 10,
                lastTimeframeStart: 1649996400000,
                aggregatedTimeframes: [{}, {}, {}],
            };

            const fetchAndProcessBatchMock = jest
                .spyOn(context.aggregateCandleSticks, 'fetchAndProcessBatch')
                .mockResolvedValue(fetchAndProcessBatchResult);

            const result =
                await context.aggregateCandleSticks.aggregateCandleSticksForSymbol(
                    {
                        symbol: 'BTC/USDT',
                        rangeDateStart: '2024-04-01 00:00:00',
                        rangeDateEnd: '2024-04-02 00:00:00',
                        timeframeDurationMs: 60000,
                        exchangeNames: ['Binance', 'Bybit', 'OKX'],
                    },
                );

            expect(fetchAndProcessBatchMock).toHaveBeenCalledTimes(1);
            expect(result.candles).not.toContain(transitionTimeframe);
        });
    });

    describe('fetchAndProcessBatch method', () => {
        test('correctly processes a batch of candlesticks', async () => {
            jest.spyOn(
                context.aggregateCandleSticks,
                'fetchCandleSticks',
            ).mockResolvedValue([{}, {}]);

            const stepSize = 100;
            jest.spyOn(
                context.aggregateCandleSticks,
                'getAggregationStepSize',
            ).mockReturnValue(stepSize);

            jest.spyOn(
                context.aggregateCandleSticks,
                'processBatch',
            ).mockResolvedValue({
                aggregatedTimeframes: [{}],
                unfinishedTimeframe: {},
                lastTimeframeStart: new Date('2023-01-01T01:00:00Z').getTime(),
            });

            const result =
                await context.aggregateCandleSticks.fetchAndProcessBatch({
                    symbol: 'BTC/USD',
                    exchangeNames: ['binance'],
                    rangeDateStart: '2023-01-01T00:00:00Z',
                    rangeDateEnd: '2023-01-02T00:00:00Z',
                    offset: 0,
                    timeframeDurationMs: 60000 * 60,
                    timeframeStart: new Date('2023-01-01T00:00:00Z').getTime(),
                    transitionTimeframe: null,
                });

            expect(result).toHaveProperty('isLastBatch', true);
            expect(result.processedCount).toBe(2);
            expect(result.aggregatedTimeframes).toHaveLength(1);
            expect(result.unfinishedTimeframe).not.toBeNull();
            expect(result.lastTimeframeStart).toBeGreaterThan(0);

            expect(
                context.aggregateCandleSticks.fetchCandleSticks,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    symbol: 'BTC/USD',
                    exchangeNames: ['binance'],
                    rangeDateStart: '2023-01-01T00:00:00Z',
                    rangeDateEnd: '2023-01-02T00:00:00Z',
                    offset: 0,
                }),
            );

            expect(
                context.aggregateCandleSticks.processBatch,
            ).toHaveBeenCalled();

            jest.restoreAllMocks();
        });

        test('returns expected result for empty candlestick batch', async () => {
            jest.spyOn(
                context.aggregateCandleSticks,
                'fetchCandleSticks',
            ).mockResolvedValue([]);

            const stepSize = 100;
            jest.spyOn(
                context.aggregateCandleSticks,
                'getAggregationStepSize',
            ).mockReturnValue(stepSize);

            const initialTimeframeStart = new Date(
                '2023-01-01T00:00:00Z',
            ).getTime();
            const transitionTimeframe = {};

            const result =
                await context.aggregateCandleSticks.fetchAndProcessBatch({
                    symbol: 'BTC/USD',
                    exchangeNames: ['binance'],
                    rangeDateStart: '2023-01-01T00:00:00Z',
                    rangeDateEnd: '2023-01-02T00:00:00Z',
                    offset: 0,
                    timeframeDurationMs: 60000 * 60,
                    timeframeStart: initialTimeframeStart,
                    transitionTimeframe: transitionTimeframe,
                });

            expect(result).toEqual({
                isLastBatch: true,
                processedCount: 0,
                aggregatedTimeframes: [],
                unfinishedTimeframe: transitionTimeframe,
                lastTimeframeStart: initialTimeframeStart,
            });

            expect(
                context.aggregateCandleSticks.fetchCandleSticks,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    symbol: 'BTC/USD',
                    exchangeNames: ['binance'],
                    rangeDateStart: '2023-01-01T00:00:00Z',
                    rangeDateEnd: '2023-01-02T00:00:00Z',
                    offset: 0,
                }),
            );
        });
    });

    describe('fetchCandleSticks method', () => {
        test('correctly queries candlesticks with expected parameters', async () => {
            const expectedQueryParams = {
                symbol: 'BTC/USD',
                exchangeNames: ['binance'],
                rangeDateStart: '2023-01-01T00:00:00Z',
                rangeDateEnd: '2023-01-02T00:00:00Z',
                offset: 0,
                orderBy: 'ASC',
                limit: stepSize,
            };

            context.CandleStickFindAllStub.mockResolvedValue([{}, {}]);

            const result =
                await context.aggregateCandleSticks.fetchCandleSticks({
                    symbol: expectedQueryParams.symbol,
                    exchangeNames: expectedQueryParams.exchangeNames,
                    rangeDateStart: expectedQueryParams.rangeDateStart,
                    rangeDateEnd: expectedQueryParams.rangeDateEnd,
                    offset: expectedQueryParams.offset,
                });

            expect(context.CandleStickStub.scope).toHaveBeenCalledWith([
                {
                    method: [
                        'search',
                        expect.objectContaining({
                            symbol: expectedQueryParams.symbol,
                            exchangeNames: expectedQueryParams.exchangeNames,
                            rangeDateStart: expectedQueryParams.rangeDateStart,
                            rangeDateEnd: expectedQueryParams.rangeDateEnd,
                            limit: stepSize,
                            offset: expectedQueryParams.offset,
                            orderBy: expectedQueryParams.orderBy,
                        }),
                    ],
                },
            ]);

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.any(Object),
                    expect.any(Object),
                ]),
            );

            expect(context.CandleStickStub.scope).toHaveBeenCalledTimes(1);

            jest.restoreAllMocks();
        });
    });

    describe('processBatch method', () => {
        test('correctly processes and aggregates a batch of candlesticks', async () => {
            jest.spyOn(
                context.aggregateCandleSticks,
                'sortChartsByTimestamp',
            ).mockImplementation((candleSticks) => candleSticks);

            const candleSticks = [
                { chart: [new Date('2023-01-01T00:00:00Z').getTime()] },
                { chart: [new Date('2023-01-01T00:30:00Z').getTime()] },
                { chart: [new Date('2023-01-01T01:00:00Z').getTime()] },
            ];

            const timeframeDurationMs = 3600000;
            const timeframeStart = new Date('2023-01-01T00:00:00Z').getTime();
            const result = await context.aggregateCandleSticks.processBatch({
                candleSticks,
                transitionTimeframe: null,
                timeframeDurationMs,
                timeframeStart,
            });

            expect(result.aggregatedTimeframes).toHaveLength(1);
            expect(result.unfinishedTimeframe).not.toBeNull();
            expect(result.lastTimeframeStart).toEqual(
                new Date('2023-01-01T01:00:00Z').getTime(),
            );

            expect(
                context.aggregateCandleSticks.sortChartsByTimestamp,
            ).toHaveBeenCalledWith(candleSticks);
        });

        test('should not call handleUnfinishedTimeframe when currentTimeframeData is empty', async () => {
            const processBatchParams = {
                candleSticks: [],
                transitionTimeframe: {},
                timeframeDurationMs: 60000,
                timeframeStart: 1649996400000,
            };

            const handleUnfinishedTimeframeMock = jest.spyOn(
                context.aggregateCandleSticks,
                'handleUnfinishedTimeframe',
            );

            const result =
                await context.aggregateCandleSticks.processBatch(
                    processBatchParams,
                );

            expect(handleUnfinishedTimeframeMock).not.toHaveBeenCalled();

            expect(result.aggregatedTimeframes).toEqual([]);
            expect(result.unfinishedTimeframe).toBeNull();
            expect(result.lastTimeframeStart).toBe(
                processBatchParams.timeframeStart,
            );
        });
    });

    describe('resolveLastTimeframeAggregation method', () => {
        test('aggregates current timeframe data without a transition timeframe', async () => {
            const currentTimeframeData = [{}];
            const currentTimeframeStart = new Date(
                '2023-01-01T00:00:00Z',
            ).getTime();

            jest.spyOn(
                context.aggregateCandleSticks,
                'aggregateCharts',
            ).mockReturnValue({});

            const result =
                context.aggregateCandleSticks.resolveLastTimeframeAggregation({
                    currentTimeframeStart,
                    currentTimeframeData,
                    transitionTimeframe: null,
                });

            expect(
                context.aggregateCandleSticks.aggregateCharts,
            ).toHaveBeenCalledWith(currentTimeframeData, currentTimeframeStart);
            expect(result).toEqual(expect.any(Object));
        });

        test('merges current timeframe data with a transition timeframe', async () => {
            const currentTimeframeData = [{}];
            const currentTimeframeStart = new Date(
                '2023-01-01T00:00:00Z',
            ).getTime();
            const transitionTimeframe = {};

            jest.spyOn(
                context.aggregateCandleSticks,
                'aggregateCharts',
            ).mockReturnValue({});

            jest.spyOn(
                context.aggregateCandleSticks,
                'mergeTransitionalData',
            ).mockReturnValue({});

            const result =
                context.aggregateCandleSticks.resolveLastTimeframeAggregation({
                    currentTimeframeStart,
                    currentTimeframeData,
                    transitionTimeframe,
                });

            expect(
                context.aggregateCandleSticks.aggregateCharts,
            ).toHaveBeenCalledWith(currentTimeframeData, currentTimeframeStart);
            expect(
                context.aggregateCandleSticks.mergeTransitionalData,
            ).toHaveBeenCalledWith(transitionTimeframe, expect.any(Object));
            expect(result).toEqual(expect.any(Object));
        });
    });

    describe('isOutsideTimeframe method', () => {
        test('returns true if chartTimestamp is before currentTimeframeStart', () => {
            const chartTimestamp = new Date('2023-01-01T00:00:00Z').getTime();
            const currentTimeframeStart = chartTimestamp + 60000;
            const currentTimeframeEnd = currentTimeframeStart + 3600000;

            const result = context.aggregateCandleSticks.isOutsideTimeframe({
                chartTimestamp,
                currentTimeframeStart,
                currentTimeframeEnd,
            });

            expect(result).toBe(true);
        });

        test('returns true if chartTimestamp is on or after currentTimeframeEnd', () => {
            const currentTimeframeStart = new Date(
                '2023-01-01T01:00:00Z',
            ).getTime();
            const currentTimeframeEnd = currentTimeframeStart + 3600000;
            const chartTimestamp = currentTimeframeEnd;

            const result = context.aggregateCandleSticks.isOutsideTimeframe({
                chartTimestamp,
                currentTimeframeStart,
                currentTimeframeEnd,
            });

            expect(result).toBe(true);
        });

        test('returns false if chartTimestamp is within the currentTimeframe', () => {
            const currentTimeframeStart = new Date(
                '2023-01-01T01:00:00Z',
            ).getTime();
            const currentTimeframeEnd = currentTimeframeStart + 3600000;
            const chartTimestamp =
                currentTimeframeStart +
                (currentTimeframeEnd - currentTimeframeStart) / 2;

            const result = context.aggregateCandleSticks.isOutsideTimeframe({
                chartTimestamp,
                currentTimeframeStart,
                currentTimeframeEnd,
            });

            expect(result).toBe(false);
        });

        test('returns false for chartTimestamp exactly at currentTimeframeStart', () => {
            const currentTimeframeStart = new Date(
                '2023-01-01T01:00:00Z',
            ).getTime();
            const currentTimeframeEnd = currentTimeframeStart + 3600000;
            const chartTimestamp = currentTimeframeStart;

            const result = context.aggregateCandleSticks.isOutsideTimeframe({
                chartTimestamp,
                currentTimeframeStart,
                currentTimeframeEnd,
            });

            expect(result).toBe(false);
        });
    });

    describe('resolveNextTimeframeInterval method', () => {
        test('calculates next interval when chart is immediately after current timeframe', () => {
            const currentTimeframeEnd = new Date(
                '2023-01-01T01:00:00Z',
            ).getTime();
            const chartTimestamp = currentTimeframeEnd + 1;
            const timeframeDurationMs = 3600000;

            const { nextTimeframeStart, nextTimeframeEnd } =
                context.aggregateCandleSticks.resolveNextTimeframeInterval({
                    currentTimeframeEnd,
                    timeframeDurationMs,
                    chartTimestamp,
                });

            expect(nextTimeframeStart).toBe(currentTimeframeEnd);
            expect(nextTimeframeEnd).toBe(
                currentTimeframeEnd + timeframeDurationMs,
            );
        });

        test('calculates next interval correctly when skipping a timeframe', () => {
            const currentTimeframeEnd = new Date(
                '2023-01-01T01:00:00Z',
            ).getTime();
            const chartTimestamp = currentTimeframeEnd + 3600001;
            const timeframeDurationMs = 3600000;

            const { nextTimeframeStart, nextTimeframeEnd } =
                context.aggregateCandleSticks.resolveNextTimeframeInterval({
                    currentTimeframeEnd,
                    timeframeDurationMs,
                    chartTimestamp,
                });

            expect(nextTimeframeStart).toBe(
                currentTimeframeEnd + timeframeDurationMs,
            );
            expect(nextTimeframeEnd).toBe(
                currentTimeframeEnd + 2 * timeframeDurationMs,
            );
        });

        test('handles chart timestamp exactly at current timeframe end', () => {
            const currentTimeframeEnd = new Date(
                '2023-01-01T01:00:00Z',
            ).getTime();
            const chartTimestamp = currentTimeframeEnd;
            const timeframeDurationMs = 3600000;

            const { nextTimeframeStart, nextTimeframeEnd } =
                context.aggregateCandleSticks.resolveNextTimeframeInterval({
                    currentTimeframeEnd,
                    timeframeDurationMs,
                    chartTimestamp,
                });

            expect(nextTimeframeStart).toBe(currentTimeframeEnd);
            expect(nextTimeframeEnd).toBe(
                currentTimeframeEnd + timeframeDurationMs,
            );
        });
    });

    describe('handleUnfinishedTimeframe method', () => {
        test('aggregates unfinished timeframe data without a transition timeframe', () => {
            const currentTimeframeData = [{}];
            const currentTimeframeStart = new Date(
                '2023-01-01T00:00:00Z',
            ).getTime();

            jest.spyOn(
                context.aggregateCandleSticks,
                'aggregateCharts',
            ).mockReturnValue({});

            const result =
                context.aggregateCandleSticks.handleUnfinishedTimeframe({
                    unfinishedTimeframe: null,
                    currentTimeframeData,
                    currentTimeframeStart,
                    transitionTimeframe: null,
                });

            expect(
                context.aggregateCandleSticks.aggregateCharts,
            ).toHaveBeenCalledWith(currentTimeframeData, currentTimeframeStart);
            expect(result).toEqual(expect.any(Object));
        });

        test('merges unfinished timeframe data with a transition timeframe', () => {
            const currentTimeframeData = [{}];
            const currentTimeframeStart = new Date(
                '2023-01-01T00:00:00Z',
            ).getTime();
            const transitionTimeframe = {};

            jest.spyOn(
                context.aggregateCandleSticks,
                'aggregateCharts',
            ).mockReturnValue({});

            jest.spyOn(
                context.aggregateCandleSticks,
                'mergeTransitionalData',
            ).mockReturnValue({});

            const result =
                context.aggregateCandleSticks.handleUnfinishedTimeframe({
                    unfinishedTimeframe: null,
                    currentTimeframeData,
                    currentTimeframeStart,
                    transitionTimeframe,
                });

            expect(
                context.aggregateCandleSticks.mergeTransitionalData,
            ).toHaveBeenCalledWith(transitionTimeframe, expect.any(Object));
            expect(result).toEqual(expect.any(Object));
        });
    });

    describe('sortChartsByTimestamp method', () => {
        test('correctly sorts charts by timestamp across multiple candlesticks', () => {
            const candleSticks = [
                {
                    marketId: 'market1',
                    charts: [
                        [new Date('2023-01-01T01:00:00Z').getTime()],
                        [new Date('2023-01-01T00:00:00Z').getTime()],
                    ],
                },
                {
                    marketId: 'market2',
                    charts: [
                        [new Date('2023-01-01T01:30:00Z').getTime()],
                        [new Date('2023-01-01T02:00:00Z').getTime()],
                    ],
                },
            ];

            const sortedCharts =
                context.aggregateCandleSticks.sortChartsByTimestamp(
                    candleSticks,
                );

            expect(sortedCharts.length).toBe(4);
            expect(sortedCharts[0].chart[0]).toBeLessThan(
                sortedCharts[1].chart[0],
            );
            expect(sortedCharts[1].chart[0]).toBeLessThan(
                sortedCharts[2].chart[0],
            );
            expect(sortedCharts[2].chart[0]).toBeLessThan(
                sortedCharts[3].chart[0],
            );

            expect(sortedCharts).toMatchObject([
                {
                    chart: [new Date('2023-01-01T00:00:00Z').getTime()],
                    marketId: 'market1',
                },
                {
                    chart: [new Date('2023-01-01T01:00:00Z').getTime()],
                    marketId: 'market1',
                },
                {
                    chart: [new Date('2023-01-01T01:30:00Z').getTime()],
                    marketId: 'market2',
                },
                {
                    chart: [new Date('2023-01-01T02:00:00Z').getTime()],
                    marketId: 'market2',
                },
            ]);
        });
    });

    describe('mergeTransitionalData method', () => {
        test('correctly merges previous and current aggregate data', () => {
            const previous = {
                timestamp: new Date('2023-01-01T00:00:00Z').getTime(),
                open: 100,
                high: 200,
                low: 90,
                close: 150,
                volume: 500,
            };
            const current = {
                timestamp: new Date('2023-01-01T01:00:00Z').getTime(),
                open: 150,
                high: 250,
                low: 80,
                close: 200,
                volume: 600,
            };

            const result = context.aggregateCandleSticks.mergeTransitionalData(
                previous,
                current,
            );

            expect(result).toEqual({
                timestamp: previous.timestamp,
                open: previous.open,
                high: 250,
                low: 80,
                close: current.close,
                volume: 1100,
                aggregatedAveragePrice: 165,
            });
        });

        test('handles null previous data correctly', () => {
            const current = {
                timestamp: new Date('2023-01-01T01:00:00Z').getTime(),
                open: 150,
                high: 250,
                low: 80,
                close: 200,
                volume: 600,
            };

            const result = context.aggregateCandleSticks.mergeTransitionalData(
                null,
                current,
            );

            expect(result).toEqual(current);
        });

        test('handles null current data correctly', () => {
            const previous = {
                timestamp: new Date('2023-01-01T00:00:00Z').getTime(),
                open: 100,
                high: 200,
                low: 90,
                close: 150,
                volume: 500,
            };

            const result = context.aggregateCandleSticks.mergeTransitionalData(
                previous,
                null,
            );

            expect(result).toEqual(previous);
        });

        test('returns null when both previous and current are null', () => {
            const result = context.aggregateCandleSticks.mergeTransitionalData(
                null,
                null,
            );

            expect(result).toBeNull();
        });
    });

    describe('aggregateCharts method', () => {
        test('correctly aggregates chart data across markets', async () => {
            jest.spyOn(
                context.aggregateCandleSticks,
                'groupChartsByMarket',
            ).mockReturnValue({
                market1: [
                    { open: 100, high: 110, low: 90, close: 105, volume: 1000 },
                ],
                market2: [
                    {
                        open: 200,
                        high: 210,
                        low: 190,
                        close: 205,
                        volume: 2000,
                    },
                ],
            });

            jest.spyOn(
                context.aggregateCandleSticks,
                'aggregateChartsByMarket',
            ).mockImplementation((groupedCharts) => {
                return Object.values(groupedCharts).map((charts) => ({
                    open: charts[0].open,
                    high: Math.max(...charts.map((chart) => chart.high)),
                    low: Math.min(...charts.map((chart) => chart.low)),
                    close: charts[charts.length - 1].close,
                    volume: charts.reduce(
                        (sum, chart) => sum + chart.volume,
                        0,
                    ),
                }));
            });

            const charts = [];
            const timestamp = new Date('2023-01-01T00:00:00Z').getTime();
            const result = await context.aggregateCandleSticks.aggregateCharts(
                charts,
                timestamp,
            );

            expect(result).toHaveProperty('timestamp', timestamp);
            expect(
                context.aggregateCandleSticks.groupChartsByMarket,
            ).toHaveBeenCalledWith(charts);
            expect(
                context.aggregateCandleSticks.aggregateChartsByMarket,
            ).toHaveBeenCalled();
            expect(result).toHaveProperty('volume');
            expect(result.aggregatedAveragePrice).toBeDefined();
        });
    });

    describe('groupChartsByMarket method', () => {
        test('correctly groups charts by market IDs', async () => {
            const charts = [
                { marketId: 'market1', chart: [1, 100, 110, 90, 105, 1000] },
                { marketId: 'market2', chart: [1, 200, 210, 190, 205, 2000] },
                { marketId: 'market1', chart: [2, 105, 115, 95, 110, 1200] },
                { marketId: 'market2', chart: [2, 210, 220, 200, 215, 2500] },
            ];

            const result =
                context.aggregateCandleSticks.groupChartsByMarket(charts);

            expect(result).toHaveProperty('market1');
            expect(result).toHaveProperty('market2');
            expect(result.market1).toHaveLength(2);
            expect(result.market2).toHaveLength(2);
            expect(result.market1[0]).toEqual([1, 100, 110, 90, 105, 1000]);
            expect(result.market1[1]).toEqual([2, 105, 115, 95, 110, 1200]);
            expect(result.market2[0]).toEqual([1, 200, 210, 190, 205, 2000]);
            expect(result.market2[1]).toEqual([2, 210, 220, 200, 215, 2500]);
        });
    });

    describe('aggregateChartsByMarket method', () => {
        test('correctly aggregates charts by market', async () => {
            const groupedByMarket = {
                market1: [
                    [1, 100, 110, 90, 105, 1000],
                    [2, 105, 115, 95, 110, 1200],
                ],
                market2: [
                    [1, 200, 210, 190, 205, 2000],
                    [2, 210, 220, 200, 215, 2500],
                ],
            };

            const result =
                context.aggregateCandleSticks.aggregateChartsByMarket(
                    groupedByMarket,
                );

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                open: 100,
                high: 115,
                low: 90,
                close: 110,
                volume: 2200,
            });
            expect(result[1]).toEqual({
                open: 200,
                high: 220,
                low: 190,
                close: 215,
                volume: 4500,
            });
        });
    });
});
