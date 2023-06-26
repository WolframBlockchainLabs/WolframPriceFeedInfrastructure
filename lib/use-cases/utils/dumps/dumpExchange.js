function dumpExchange(item) {
    return {
        id: item.id,
        externalExchangeId: item.externalExchangeId,
        name: item.name,
    };
}

export default dumpExchange;
