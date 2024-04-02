import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';
import median from '#utils/median.js';

class DiscreteAggregation extends BaseUseCase {
    get validationRules() {
        const maxDateDiff =
            this.context.maxDateDiff ??
            this.config.apiLimits.aggregations.maxDateDiff;

        return {
            symbols: [
                'required',
                { list_of: ['not_null', 'not_empty', 'string'] },
            ],
            exchangeNames: [
                'required',
                { list_of: ['not_null', 'not_empty', 'string'] },
            ],
            rangeDateStart: [
                'required',
                'not_empty',
                'iso_timestamp',
                { date_compare: maxDateDiff },
            ],
            rangeDateEnd: [
                'required',
                'not_empty',
                'iso_timestamp',
                { date_compare: maxDateDiff },
            ],
            timeframeMinutes: [
                'positive_integer',
                {
                    default: 60,
                },
            ],
        };
    }

    getAggregationStepSize() {
        return (
            this.context.stepSize ?? this.config.apiLimits.aggregations.stepSize
        );
    }

    shouldCache({ rangeDateEnd }) {
        return Date.now() > new Date(rangeDateEnd).getTime();
    }

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
        let aggregatedData = [];
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

            aggregatedData.push(...batchResult.aggregatedTimeframes);
        }

        if (transitionTimeframe) {
            aggregatedData.push(transitionTimeframe);
        }

        return {
            symbol,
            processedCount: offset,
            count: aggregatedData.length,
            candles: aggregatedData,
        };
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
            offset,
        });

        const isLastBatch = candleSticks.length < this.getAggregationStepSize();

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

    async fetchCandleSticks({
        symbol,
        exchangeNames,
        rangeDateStart,
        rangeDateEnd,
        offset,
    }) {
        return CandleStick.scope([
            {
                method: [
                    'search',
                    {
                        symbol,
                        exchangeNames,
                        rangeDateStart,
                        rangeDateEnd,
                        limit: this.getAggregationStepSize(),
                        offset,
                        orderBy: 'ASC',
                    },
                ],
            },
        ]).findAll();
    }

    async processBatch({
        candleSticks,
        transitionTimeframe,
        timeframeDurationMs,
        timeframeStart,
    }) {
        const charts = this.sortChartsByTimestamp(candleSticks);

        let unfinishedTimeframe = null;
        let aggregatedTimeframes = [];

        let currentTimeframeStart = timeframeStart;
        let currentTimeframeEnd = currentTimeframeStart + timeframeDurationMs;
        let currentTimeframeData = [];

        charts.forEach((candle) => {
            const chartTimestamp = candle.chart[0];

            if (
                this.isOutsideTimeframe({
                    chartTimestamp,
                    currentTimeframeStart,
                    currentTimeframeEnd,
                })
            ) {
                const aggregatedCharts = this.resolveLastTimeframeAggregation({
                    currentTimeframeStart,
                    currentTimeframeData,
                    transitionTimeframe,
                });

                const timeframeBounds = this.resolveNextTimeframeInterval({
                    currentTimeframeEnd,
                    timeframeDurationMs,
                    chartTimestamp,
                });

                currentTimeframeStart = timeframeBounds.nextTimeframeStart;
                currentTimeframeEnd = timeframeBounds.nextTimeframeEnd;

                if (aggregatedCharts) {
                    aggregatedTimeframes.push(aggregatedCharts);
                }

                currentTimeframeData = [];
            }

            currentTimeframeData.push(candle);
        });

        if (currentTimeframeData.length > 0) {
            unfinishedTimeframe = this.handleUnfinishedTimeframe({
                unfinishedTimeframe,
                currentTimeframeData,
                currentTimeframeStart,
                transitionTimeframe,
            });
        }

        return {
            aggregatedTimeframes,
            unfinishedTimeframe,
            lastTimeframeStart: currentTimeframeStart,
        };
    }

    resolveLastTimeframeAggregation({
        currentTimeframeStart,
        currentTimeframeData,
        transitionTimeframe,
    }) {
        let aggregatedCharts = null;

        if (currentTimeframeData.length > 0) {
            aggregatedCharts = this.aggregateCharts(
                currentTimeframeData,
                currentTimeframeStart,
            );
        }

        if (transitionTimeframe) {
            aggregatedCharts = this.mergeTransitionalData(
                transitionTimeframe,
                aggregatedCharts,
            );
        }

        return aggregatedCharts;
    }

    isOutsideTimeframe({
        chartTimestamp,
        currentTimeframeStart,
        currentTimeframeEnd,
    }) {
        return (
            chartTimestamp < currentTimeframeStart ||
            chartTimestamp >= currentTimeframeEnd
        );
    }

    resolveNextTimeframeInterval({
        currentTimeframeEnd,
        timeframeDurationMs,
        chartTimestamp,
    }) {
        const timeframeDiff = chartTimestamp - currentTimeframeEnd;
        const timeframesToSkip = Math.floor(
            timeframeDiff / timeframeDurationMs,
        );

        const nextTimeframeStart =
            currentTimeframeEnd + timeframeDurationMs * timeframesToSkip;
        const nextTimeframeEnd = nextTimeframeStart + timeframeDurationMs;

        return { nextTimeframeStart, nextTimeframeEnd };
    }

    handleUnfinishedTimeframe({
        unfinishedTimeframe,
        currentTimeframeData,
        currentTimeframeStart,
        transitionTimeframe,
    }) {
        let nextTransitionTimeframe = this.aggregateCharts(
            currentTimeframeData,
            currentTimeframeStart,
        );

        if (transitionTimeframe) {
            nextTransitionTimeframe = this.mergeTransitionalData(
                transitionTimeframe,
                unfinishedTimeframe,
            );
        }

        return nextTransitionTimeframe;
    }

    sortChartsByTimestamp(candleSticks) {
        return candleSticks
            .flatMap((cs) =>
                cs.charts.map((chart) => ({
                    marketId: cs.marketId,
                    chart,
                })),
            )
            .sort((a, b) => a.chart[0] - b.chart[0]);
    }

    mergeTransitionalData(previous, current) {
        if (!previous || !current) return previous || current;

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

export default DiscreteAggregation;
