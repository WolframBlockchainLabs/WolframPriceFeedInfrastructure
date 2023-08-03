function dumpTrade(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        tradesInfo: item.tradesInfo,
        createdAt: item.createdAt,
        exchangeName: item.Market.Exchange.name,
        intervalStart: item.intervalStart,
        intervalEnd: item.intervalEnd,
    };
}

export default dumpTrade;
