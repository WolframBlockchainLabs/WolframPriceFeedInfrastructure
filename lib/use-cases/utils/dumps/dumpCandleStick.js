function dumpCandleStick(item) {
    return {
        id: item.id,
        marketId: item.marketId,
        charts: item.charts,
        createdAt: item.createdAt,
        exchangeName: item.Market.Exchange.name,
    };
}

export default dumpCandleStick;
