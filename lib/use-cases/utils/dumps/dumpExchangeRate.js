function dumpExchangeRate(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        poolASize: item.poolASize,
        poolBSize: item.poolBSize,
        exchangeRate: item.exchangeRate,
        createdAt: item.createdAt,
        exchangeName: item.Market.Exchange.name,
        intervalStart: item.intervalStart,
        intervalEnd: item.intervalEnd,
    };
}

export default dumpExchangeRate;
