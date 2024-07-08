function dumpExchange(item) {
    return {
        id: item.id,
        externalExchangeId: item.externalExchangeId,
        dataSource: item.dataSource,
        name: item.name,
    };
}

export default dumpExchange;
