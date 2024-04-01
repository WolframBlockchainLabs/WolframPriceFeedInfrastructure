import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
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

    async execute(queryParams) {
        const results = await Promise.all(
            queryParams.symbols.map((symbol) =>
                this.generateCondensedCandleSticks({
                    symbol,
                    ...queryParams,
                }),
            ),
        );

        return { data: results };
    }

    async generateCondensedCandleSticks({
        symbol,
        rangeDateStart,
        rangeDateEnd,
        timeframeMinutes,
        exchangeNames,
    }) {
        const condensedData = [];
        let currentTimeframeStart = new Date(rangeDateStart).getTime();
        const rangeEnd = new Date(rangeDateEnd).getTime();
        const timeframeDurationMs = timeframeMinutes * MILLISECONDS_IN_A_MINUTE;

        while (currentTimeframeStart < rangeEnd) {
            const roundTimeOffset = currentTimeframeStart + timeframeDurationMs;
            const currentTimeframeEnd =
                roundTimeOffset > rangeEnd ? rangeEnd : roundTimeOffset;
            const candleSticks = await this.fetchCandleSticks({
                exchangeNames,
                symbol,
                rangeDateStart: new Date(currentTimeframeStart).toISOString(),
                rangeDateEnd: new Date(currentTimeframeEnd).toISOString(),
            });

            if (candleSticks.length > 0) {
                const condensedCandlestick = this.condenseCandleSticks(
                    candleSticks,
                    currentTimeframeStart,
                );

                condensedData.push(condensedCandlestick);
            }

            currentTimeframeStart += timeframeDurationMs;
        }

        return {
            symbol,
            exchanges: exchangeNames,
            timeframe: timeframeMinutes,
            charts: condensedData,
        };
    }

    async fetchCandleSticks(queryParams) {
        return CandleStick.scope([
            {
                method: ['search', { ...queryParams, orderBy: 'ASC' }],
            },
        ]).findAll();
    }

    condenseCandleSticks(candleSticks, timestamp) {
        const allCharts = candleSticks
            .flatMap((cs) =>
                cs.charts.map((chart) => ({
                    marketId: cs.marketId,
                    chart: chart,
                })),
            )
            .sort((a, b) => a.chart[0] - b.chart[0]);

        const groupedByMarketId = allCharts.reduce(
            (acc, { marketId, chart }) => {
                if (!acc[marketId]) acc[marketId] = [];
                acc[marketId].push(chart);
                return acc;
            },
            {},
        );

        const aggregatesPerExchange = Object.values(groupedByMarketId).map(
            (charts) => {
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
            },
        );

        const mergedAggregate = {
            timestamp,
            open: this.median(aggregatesPerExchange.map((a) => a.open)),
            high: this.median(aggregatesPerExchange.map((a) => a.high)),
            low: this.median(aggregatesPerExchange.map((a) => a.low)),
            close: this.median(aggregatesPerExchange.map((a) => a.close)),
            volume: aggregatesPerExchange.reduce((sum, a) => sum + a.volume, 0),
        };

        mergedAggregate.aggregatedAveragePrice =
            (mergedAggregate.high + mergedAggregate.low) / 2;

        return mergedAggregate;
    }

    median(values) {
        if (values.length === 0) return null;
        values.sort((a, b) => a - b);
        const half = Math.floor(values.length / 2);
        if (values.length % 2) {
            return values[half];
        }
        return (values[half - 1] + values[half]) / 2;
    }
}

export default DiscreteCandleSticksAggregationUseCase;
