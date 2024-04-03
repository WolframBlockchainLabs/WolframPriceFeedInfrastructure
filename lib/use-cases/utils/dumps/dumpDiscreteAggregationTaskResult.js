import dumpExchange from './dumpExchange.js';

function dumpDiscreteAggregationTaskResult(item) {
    console.log(item);

    return {
        id: item.id,
        symbol: item.symbol,
        rangeDateStart: item.rangeDateStart.toISOString(),
        rangeDateEnd: item.rangeDateEnd.toISOString(),
        timeframeMinutes: item.timeframeMinutes,
        results: item.results,
        taskId: item.taskId,
        ...(item.Exchanges && { exchanges: item.Exchanges.map(dumpExchange) }),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    };
}

export default dumpDiscreteAggregationTaskResult;
