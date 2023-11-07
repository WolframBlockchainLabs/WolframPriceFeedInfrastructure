function dumpCandleStickAggregate(item) {
    return item.reduce((results, { symbol, interval, aggregatedData }) => {
        results[symbol] = {
            interval,
            aggregatedData: {
                open: aggregatedData.open,
                high: aggregatedData.high,
                low:
                    aggregatedData.low === Number.MAX_VALUE
                        ? null
                        : aggregatedData.low,
                close: aggregatedData.close,
                volume: aggregatedData.volume,
            },
        };

        return results;
    }, {});
}

export default dumpCandleStickAggregate;
