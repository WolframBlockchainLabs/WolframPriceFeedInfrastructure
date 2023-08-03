function dumpOrderBook(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        bids: item.bids,
        asks: item.asks,
        createdAt: item.createdAt,
        exchangeName: item.Market.Exchange.name,
        intervalStart: item.intervalStart,
        intervalEnd: item.intervalEnd,
    };
}

export default dumpOrderBook;
