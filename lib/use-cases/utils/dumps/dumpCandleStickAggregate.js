function dumpCandleStickAggregate({ pairs, rangeDateStart, rangeDateEnd }) {
    const aggregatedPairs = pairs.reduce(
        (results, { symbol, aggregatedData, aggregatedRecords }) => {
            results[symbol] = {
                aggregatedData: {
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
                },
                aggregatedRecords,
            };

            return results;
        },
        {},
    );

    return {
        rangeDateStart,
        rangeDateEnd,
        aggregatedPairs,
    };
}

export default dumpCandleStickAggregate;
