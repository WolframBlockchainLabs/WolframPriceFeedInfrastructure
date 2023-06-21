export function dumpOrderBook(item) {
    return {
        id           : item.id,
        marketId     : item.marketId,
        bids         : item.bids,
        asks         : item.asks,
        createdAt    : item.createdAt,
        exchangeName : item.Market.Exchange.name
    };
}

export function dumpCandleStick(item) {
    return {
        id           : item.id,
        marketId     : item.marketId,
        charts       : item.charts,
        createdAt    : item.createdAt,
        exchangeName : item.Market.Exchange.name
    };
}

export function dumpTicker(item) {
    return {
        id            : item.id,
        marketId      : item.marketId,
        high          : item.high,
        low           : item.low,
        bid           : item.bid,
        bidVolume     : item.bidVolume,
        ask           : item.ask,
        askVolume     : item.askVolume,
        vwap          : item.vwap,
        open          : item.open,
        close         : item.close,
        last          : item.last,
        previousClose : item.previousClose,
        change        : item.change,
        percentage    : item.percentage,
        average       : item.average,
        baseVolume    : item.baseVolume,
        quoteVolume   : item.quoteVolume,
        createdAt     : item.createdAt,
        exchangeName  : item.Market.Exchange.name
    };
}

export function dumpTrade(item) {
    return {
        id           : item.id,
        marketId     : item.marketId,
        tradesInfo   : item.tradesInfo,
        createdAt    : item.createdAt,
        exchangeName : item.Market.Exchange.name
    };
}
