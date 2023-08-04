function dumpCandleStick(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        charts: item.charts,
        createdAt: item.createdAt,
        exchangeName: item.Market.Exchange.name,
        intervalStart: item.intervalStart,
        intervalEnd: item.intervalEnd,
    };
}

export default dumpCandleStick;
