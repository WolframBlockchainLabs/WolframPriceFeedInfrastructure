import dumpExchange from './dumpExchange.js';

function dumpDiscreteAggregationTaskResult(item) {
    return {
        id: item.id,
        symbol: item.symbol,
        rangeDateStart: item.rangeDateStart.toISOString(),
        rangeDateEnd: item.rangeDateEnd.toISOString(),
        timeframeMinutes: item.timeframeMinutes,
        processedCount: item.processedCount,
        count: item.count,
        candles: item.candles,
        taskId: item.taskId,
        ...(item.Exchanges && { exchanges: item.Exchanges.map(dumpExchange) }),
        createdAt: item.createdAt.toISOString(),
    };
}

export default dumpDiscreteAggregationTaskResult;
