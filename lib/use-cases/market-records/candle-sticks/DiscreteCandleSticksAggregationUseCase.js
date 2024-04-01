import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import median from '#utils/median.js';
import BaseMarketRecordUseCase from '../BaseMarketRecordUseCase.js';

class DiscreteCandleSticksAggregationUseCase extends BaseMarketRecordUseCase {
    static DEFAULT_AGGREGATION_STEP_SIZE = 1000;

    static DEFAULT_TIMEFRAME_MINUTES = 60;

    validationRules = {
        symbols: ['required', { list_of: ['not_null', 'not_empty', 'string'] }],
        exchangeNames: [
            'required',
            { list_of: ['not_null', 'not_empty', 'string'] },
        ],
        rangeDateStart: [
            'required',
            'not_empty',
            'iso_timestamp',
            'date_compare',
        ],
        rangeDateEnd: [
            'required',
            'not_empty',
            'iso_timestamp',
            'date_compare',
        ],
        timeframeMinutes: [
            'positive_integer',
            {
                default:
                    DiscreteCandleSticksAggregationUseCase.DEFAULT_TIMEFRAME_MINUTES,
            },
        ],
    };

    async execute({
        symbols,
        exchangeNames,
        rangeDateStart,
        rangeDateEnd,
        timeframeMinutes,
    }) {
        const timeframeDurationMs = timeframeMinutes * MILLISECONDS_IN_A_MINUTE;

        const pairs = await Promise.all(
            symbols.map((symbol) =>
                this.aggregateCandleSticksForSymbol({
                    symbol,
                    rangeDateStart,
                    rangeDateEnd,
                    timeframeDurationMs,
                    exchangeNames,
                }),
            ),
        );

        return {
            data: {
                timeframeMinutes,
                rangeDateStart,
                rangeDateEnd,
                exchangeNames,
                pairs,
            },
        };
    }

    async aggregateCandleSticksForSymbol({
        symbol,
        rangeDateStart,
        rangeDateEnd,
        timeframeDurationMs,
        exchangeNames,
    }) {
        let condensedData = [];
        let offset = 0;
        let isLastBatch = false;
        let transitionTimeframe = null;
        let timeframeStart = new Date(rangeDateStart).getTime();

        while (!isLastBatch) {
            const batchResult = await this.fetchAndProcessBatch({
                symbol,
                exchangeNames,
                rangeDateStart,
                rangeDateEnd,
                offset,
                timeframeDurationMs,
                timeframeStart,
                transitionTimeframe,
            });

            isLastBatch = batchResult.isLastBatch;
            offset += batchResult.processedCount;
            timeframeStart = batchResult.lastTimeframeStart;
            transitionTimeframe = batchResult.unfinishedTimeframe;

            condensedData.push(...batchResult.aggregatedTimeframes);
        }

        if (transitionTimeframe) {
            condensedData.push(transitionTimeframe);
        }

        return condensedData;
    }

    async fetchAndProcessBatch({
        symbol,
        exchangeNames,
        rangeDateStart,
        rangeDateEnd,
        offset,
        timeframeDurationMs,
        timeframeStart,
        transitionTimeframe,
    }) {
        const candleSticks = await this.fetchCandleSticks({
            symbol,
            exchangeNames,
            rangeDateStart,
            rangeDateEnd,
            limit: DiscreteCandleSticksAggregationUseCase.DEFAULT_AGGREGATION_STEP_SIZE,
            offset,
        });

        const isLastBatch =
            candleSticks.length <
            DiscreteCandleSticksAggregationUseCase.DEFAULT_AGGREGATION_STEP_SIZE;

        if (!candleSticks.length) {
            return {
                isLastBatch,
                processedCount: 0,
                aggregatedTimeframes: [],
                unfinishedTimeframe: transitionTimeframe,
                lastTimeframeStart: timeframeStart,
            };
        }

        const batchProcessResult = await this.processBatch({
            candleSticks,
            transitionTimeframe,
            timeframeDurationMs,
            timeframeStart,
        });

        return {
            isLastBatch,
            processedCount: candleSticks.length,
            aggregatedTimeframes: batchProcessResult.aggregatedTimeframes,
            unfinishedTimeframe: batchProcessResult.unfinishedTimeframe,
            lastTimeframeStart: batchProcessResult.lastTimeframeStart,
        };
    }

    async fetchCandleSticks(queryParams) {
        return CandleStick.scope([
            {
                method: ['search', { ...queryParams, orderBy: 'ASC' }],
            },
        ]).findAll();
    }

    async processBatch({
        candleSticks,
        transitionTimeframe,
        timeframeDurationMs,
        timeframeStart,
    }) {
        const allCharts = candleSticks
            .flatMap((cs) =>
                cs.charts.map((chart) => ({
                    marketId: cs.marketId,
                    chart,
                })),
            )
            .sort((a, b) => a.chart[0] - b.chart[0]);

        let unfinishedTimeframe = transitionTimeframe;
        let aggregatedTimeframes = [];
        let currentTimeframeStart = timeframeStart;
        let currentTimeframeEnd = currentTimeframeStart + timeframeDurationMs;
        let currentTimeframeData = [];
        let allChartsProcessed = false;
        let currentChartIndex = 0;

        while (!allChartsProcessed) {
            const candle = allCharts[currentChartIndex];
            const chartTimestamp = candle.chart[0];

            if (
                chartTimestamp < currentTimeframeStart ||
                chartTimestamp >= currentTimeframeEnd
            ) {
                let condensed = null;

                if (currentTimeframeData.length > 0) {
                    condensed = this.aggregateCharts(
                        currentTimeframeData,
                        currentTimeframeStart,
                    );
                }

                if (unfinishedTimeframe) {
                    condensed = this.mergeTransitionalData(
                        unfinishedTimeframe,
                        condensed,
                    );

                    unfinishedTimeframe = null;
                }

                if (condensed) {
                    aggregatedTimeframes.push(condensed);
                }

                currentTimeframeStart = currentTimeframeEnd;
                currentTimeframeEnd =
                    currentTimeframeStart + timeframeDurationMs;
            } else {
                currentTimeframeData.push(candle);

                currentChartIndex++;
                allChartsProcessed = currentChartIndex >= allCharts.length;
            }
        }

        if (currentTimeframeData.length > 0) {
            unfinishedTimeframe = this.aggregateCharts(
                currentTimeframeData,
                currentTimeframeStart,
            );

            if (transitionTimeframe) {
                unfinishedTimeframe = this.mergeTransitionalData(
                    transitionTimeframe,
                    unfinishedTimeframe,
                );
            }
        }

        return {
            aggregatedTimeframes,
            unfinishedTimeframe,
            lastTimeframeStart: currentTimeframeStart,
        };
    }

    mergeTransitionalData(previous, current) {
        const mergedAggregate = {
            timestamp: Math.min(previous.timestamp, current.timestamp),
            open: previous.open,
            high: Math.max(previous.high, current.high),
            low: Math.min(previous.low, current.low),
            close: current.close,
            volume: previous.volume + current.volume,
        };

        mergedAggregate.aggregatedAveragePrice =
            (mergedAggregate.high + mergedAggregate.low) / 2;

        return mergedAggregate;
    }

    aggregateCharts(charts, timestamp) {
        const groupedByMarketId = this.groupChartsByMarket(charts);
        const aggregatesPerExchange =
            this.aggregateChartsByMarket(groupedByMarketId);

        const mergedAggregate = {
            timestamp,
            open: median(aggregatesPerExchange.map((a) => a.open)),
            high: median(aggregatesPerExchange.map((a) => a.high)),
            low: median(aggregatesPerExchange.map((a) => a.low)),
            close: median(aggregatesPerExchange.map((a) => a.close)),
            volume: aggregatesPerExchange.reduce((sum, a) => sum + a.volume, 0),
        };

        mergedAggregate.aggregatedAveragePrice =
            (mergedAggregate.high + mergedAggregate.low) / 2;

        return mergedAggregate;
    }

    groupChartsByMarket(charts) {
        return charts.reduce((acc, { marketId, chart }) => {
            if (!acc[marketId]) acc[marketId] = [];

            acc[marketId].push(chart);

            return acc;
        }, {});
    }

    aggregateChartsByMarket(groupedByMarket) {
        return Object.values(groupedByMarket).map((charts) => {
            const open = charts[0][1];
            const close = charts[charts.length - 1][4];
            const high = Math.max(...charts.map((chart) => chart[2]));
            const low = Math.min(...charts.map((chart) => chart[3]));
            const volume = charts.reduce((sum, chart) => sum + chart[5], 0);

            return {
                open,
                high,
                low,
                close,
                volume,
            };
        });
    }
}

export default DiscreteCandleSticksAggregationUseCase;
