function dumpOrderBook(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        bids: item.bids,
        asks: item.asks,
        createdAt: item.createdAt.toISOString(),
        exchangeName: item.Market?.Exchange?.name,
        symbol: item.Market?.symbol,
        intervalStart: item.intervalStart.toISOString(),
        intervalEnd: item.intervalEnd.toISOString(),
    };
}

export default dumpOrderBook;
