function dumpTrade(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        tradesInfo: item.tradesInfo,
        createdAt: item.createdAt,
        exchangeName: item.Market.Exchange.name,
    };
}

export default dumpTrade;
