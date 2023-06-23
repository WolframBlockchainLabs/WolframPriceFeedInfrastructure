function dumpMarket(item) {
    return {
        id: item.id,
        externalMarketId: item.externalMarketId,
        symbol: item.symbol,
        base: item.base,
        quote: item.quote,
        baseId: item.baseId,
        quoteId: item.quoteId,
        active: item.active,
    };
}

export default dumpMarket;
