import Base from '../BaseUseCase.js';
import dumpCandleStickAggregate from '../utils/dumps/dumpCandleStickAggregate.js';
import CandleSticksList from './List.js';

class AggregateCandleSticks extends Base {
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
        limit: ['not_empty', 'positive_integer', { default: 1000 }],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
    };

    async execute(queryParams) {
        const results = await Promise.all(
            queryParams.symbols.map((symbol) =>
                this.processSymbol(symbol, queryParams),
            ),
        );

        return {
            data: dumpCandleStickAggregate(results),
        };
    }

    async processSymbol(symbol, queryParams) {
        const aggregatedData = this.createDefaultAggregate();

        let fetchMore = true;
        let offset = queryParams.offset;

        while (fetchMore) {
            const candleSticks = await this.fetchCandleSticks({
                ...queryParams,
                symbol,
                offset,
            });

            this.updateAggregate(aggregatedData, candleSticks.data);

            fetchMore = candleSticks.meta.fetchCount >= queryParams.limit;
            offset += queryParams.limit;
        }

        return {
            symbol,
            interval: {
                start: queryParams.rangeDateStart,
                end: queryParams.rangeDateEnd,
            },
            aggregatedData,
        };
    }

    async fetchCandleSticks(queryParams) {
        return new CandleSticksList({ context: this.context }).execute(
            queryParams,
        );
    }

    updateAggregate(aggregate, data) {
        data.reduce((agg, { charts }) => {
            if (charts && charts.length > 0) {
                agg.open = this.getFirstOpen(agg.open, charts);
                agg.high = this.getMaxHigh(agg.high, charts);
                agg.low = this.getMinLow(agg.low, charts);
                agg.close = this.getLastClose(charts);
                agg.volume += this.getTotalVolume(charts);
            }
            return agg;
        }, aggregate);
    }

    getFirstOpen(currentOpen, charts) {
        return currentOpen ?? charts[0][1];
    }

    getMaxHigh(currentHigh, charts) {
        const highs = charts.map((chart) => chart[2]);

        return Math.max(currentHigh, ...highs);
    }

    getMinLow(currentLow, charts) {
        const lows = charts.map((chart) => chart[3]);

        return Math.min(currentLow, ...lows);
    }

    getLastClose(charts) {
        return charts[charts.length - 1][4];
    }

    getTotalVolume(charts) {
        return charts.reduce((sum, chart) => sum + chart[5], 0);
    }

    createDefaultAggregate() {
        return {
            open: null,
            high: 0,
            low: Number.MAX_VALUE,
            close: null,
            volume: 0,
        };
    }
}

export default AggregateCandleSticks;
