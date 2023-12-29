import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import BaseCacheUseCase from '#use-cases/BaseCacheUseCase.js';
import dumpCandleStickAggregate from '../utils/dumps/dumpCandleStickAggregate.js';

class AggregateCandleSticks extends BaseCacheUseCase {
    static AGGREGATION_STEP_SIZE = 1000;

    static validationRules = {
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
        limit: [
            'not_empty',
            'positive_integer',
            { max_number: 10000 },
            { default: 1000 },
        ],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
    };

    async execute(queryParams) {
        const steps = Math.ceil(
            queryParams.limit / AggregateCandleSticks.AGGREGATION_STEP_SIZE,
        );

        const results = await Promise.all(
            queryParams.symbols.map((symbol) =>
                this.aggregateDataForSymbol({
                    symbol,
                    queryParams,
                    steps,
                }),
            ),
        );

        return {
            data: dumpCandleStickAggregate({
                pairs: results,
                rangeDateStart: queryParams.rangeDateStart,
                rangeDateEnd: queryParams.rangeDateEnd,
            }),
        };
    }

    async aggregateDataForSymbol({ symbol, queryParams, steps }) {
        const aggregatedDataByMarket = {
            open: {},
            high: {},
            low: {},
            close: {},
            volume: 0,
        };

        let offset = queryParams.offset;

        for (let step = 0; step < steps; step++) {
            const stepLimit = this.getStepLimit({
                step,
                steps,
                limit: queryParams.limit,
            });

            const candleSticks = await this.fetchCandleSticks({
                ...queryParams,
                limit: stepLimit,
                symbol,
                offset,
            });

            this.updateMarketsAggregate(aggregatedDataByMarket, candleSticks);

            offset += candleSticks.length;

            /* istanbul ignore next */
            if (candleSticks.length < stepLimit) break;
        }

        return {
            symbol,
            aggregatedData: this.calculateCommonAggregate(
                aggregatedDataByMarket,
            ),
            aggregatedRecords: offset,
        };
    }

    async fetchCandleSticks(queryParams) {
        return CandleStick.scope([
            {
                method: ['search', { ...queryParams, orderBy: 'ASC' }],
            },
        ]).findAll();
    }

    /* istanbul ignore next */
    getStepLimit({ step, steps, limit }) {
        const isLastStep = step === steps - 1;
        const stepLimit = isLastStep
            ? limit % AggregateCandleSticks.AGGREGATION_STEP_SIZE
            : AggregateCandleSticks.AGGREGATION_STEP_SIZE;

        return stepLimit || AggregateCandleSticks.AGGREGATION_STEP_SIZE;
    }

    updateMarketsAggregate(aggregate, data) {
        data.reduce((agg, { charts, marketId }) => {
            /* istanbul ignore next */
            if (charts && charts.length > 0) {
                agg.open[marketId] = this.getFirstOpen(
                    agg.open[marketId],
                    charts,
                );
                agg.high[marketId] = this.getMaxHigh(
                    agg.high[marketId],
                    charts,
                );
                agg.low[marketId] = this.getMinLow(agg.low[marketId], charts);
                agg.close[marketId] = this.getLastClose(charts);
                agg.volume += this.getTotalVolume(charts);
            }
            return agg;
        }, aggregate);
    }

    calculateCommonAggregate(marketsAggregate) {
        const commonAggregate = {
            open: this.calculateMedian(Object.values(marketsAggregate.open)),
            high: this.calculateMedian(Object.values(marketsAggregate.high)),
            low: this.calculateMedian(Object.values(marketsAggregate.low)),
            close: this.calculateMedian(Object.values(marketsAggregate.close)),
        };

        return {
            ...commonAggregate,
            volume: marketsAggregate.volume,
            aggregatedAveragePrice:
                (commonAggregate.high + commonAggregate.low) / 2,
        };
    }

    /* istanbul ignore next */
    calculateMedian(numbers) {
        if (numbers.length === 0) return null;

        const sortedNumbers = [...numbers].sort((a, b) => a - b);
        const half = Math.floor(sortedNumbers.length / 2);

        if (sortedNumbers.length % 2) return sortedNumbers[half];
        return (sortedNumbers[half - 1] + sortedNumbers[half]) / 2;
    }

    getFirstOpen(currentOpen, charts) {
        return currentOpen ?? charts[0][1];
    }

    getMaxHigh(currentHigh = Number.MIN_VALUE, charts) {
        const highs = charts.map((chart) => chart[2]);

        return Math.max(currentHigh, ...highs);
    }

    getMinLow(currentLow = Number.MAX_VALUE, charts) {
        const lows = charts.map((chart) => chart[3]);

        return Math.min(currentLow, ...lows);
    }

    getLastClose(charts) {
        return charts[charts.length - 1][4];
    }

    getTotalVolume(charts) {
        return charts.reduce((sum, chart) => sum + chart[5], 0);
    }
}

export default AggregateCandleSticks;
