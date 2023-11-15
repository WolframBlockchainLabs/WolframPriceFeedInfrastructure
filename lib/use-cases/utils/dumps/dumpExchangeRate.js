function dumpExchangeRate(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        poolASize: item.poolASize,
        poolBSize: item.poolBSize,
        exchangeRate: item.exchangeRate,
        createdAt: item.createdAt.toISOString(),
        exchangeName: item.Market?.Exchange?.name,
        symbol: item.Market?.symbol,
        intervalStart: item.intervalStart.toISOString(),
        intervalEnd: item.intervalEnd.toISOString(),
    };
}

export default dumpExchangeRate;
