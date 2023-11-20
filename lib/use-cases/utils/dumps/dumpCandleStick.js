function dumpCandleStick(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        charts: item.charts,
        createdAt: item.createdAt.toISOString(),
        exchangeName: item.Market?.Exchange?.name,
        symbol: item.Market?.symbol,
        intervalStart: item.intervalStart.toISOString(),
        intervalEnd: item.intervalEnd.toISOString(),
    };
}

export default dumpCandleStick;
