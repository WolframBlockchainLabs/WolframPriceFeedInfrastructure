import dumpExchange from './dumpExchange.js';

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
        ...(item.Exchange && { exchange: dumpExchange(item.Exchange) }),
    };
}

export default dumpMarket;
