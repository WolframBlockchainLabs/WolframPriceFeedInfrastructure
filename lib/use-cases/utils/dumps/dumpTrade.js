function dumpTrade(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        tradesInfo: item.tradesInfo,
        createdAt: item.createdAt.toISOString(),
        exchangeName: item.Market?.Exchange?.name,
        symbol: item.Market?.symbol,
        intervalStart: item.intervalStart.toISOString(),
        intervalEnd: item.intervalEnd.toISOString(),
    };
}

export default dumpTrade;
