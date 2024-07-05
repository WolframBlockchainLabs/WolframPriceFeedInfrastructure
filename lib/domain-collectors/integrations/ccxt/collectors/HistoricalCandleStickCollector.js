import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';

class HistoricalCandleStickCollector extends CandleStickCollector {
    formatAggregationInterval({ intervalStart, intervalEnd }) {
        return {
            intervalStart,
            intervalEnd,
        };
    }
}

export default HistoricalCandleStickCollector;
