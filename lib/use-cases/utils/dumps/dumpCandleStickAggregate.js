function dumpCandleStickAggregate({ pairs, rangeDateStart, rangeDateEnd }) {
    const formattedPairs = pairs.reduce(
        (results, { symbol, aggregatedData }) => {
            results[symbol] = {
                open: aggregatedData.open,
                high: aggregatedData.high,
                low:
                    aggregatedData.low === Number.MAX_VALUE
                        ? null
                        : aggregatedData.low,
                close: aggregatedData.close,
                volume: aggregatedData.volume || null,
                aggregatedAveragePrice:
                    aggregatedData.aggregatedAveragePrice || null,
            };

            return results;
        },
        {},
    );

    return {
        rangeDateStart,
        rangeDateEnd,
        aggregatedPairs: formattedPairs,
    };
}

export default dumpCandleStickAggregate;
