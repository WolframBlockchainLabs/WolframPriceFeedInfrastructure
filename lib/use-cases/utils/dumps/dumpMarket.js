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
        meta: item.meta,
        baseMeta: item.baseMeta,
        quoteMeta: item.quoteMeta,
        historical: item.historical,
        active: item.active,
        ...(item.exchangeId && { exchangeId: item.exchangeId }),
        ...(item.Exchange && { exchange: dumpExchange(item.Exchange) }),
    };
}

export default dumpMarket;
