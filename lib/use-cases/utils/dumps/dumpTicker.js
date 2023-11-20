function dumpTicker(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        high: item.high,
        low: item.low,
        bid: item.bid,
        bidVolume: item.bidVolume,
        ask: item.ask,
        askVolume: item.askVolume,
        vwap: item.vwap,
        open: item.open,
        close: item.close,
        last: item.last,
        previousClose: item.previousClose,
        change: item.change,
        percentage: item.percentage,
        average: item.average,
        baseVolume: item.baseVolume,
        quoteVolume: item.quoteVolume,
        createdAt: item.createdAt.toISOString(),
        exchangeName: item.Market?.Exchange?.name,
        symbol: item.Market?.symbol,
        intervalStart: item.intervalStart.toISOString(),
        intervalEnd: item.intervalEnd.toISOString(),
    };
}

export default dumpTicker;
