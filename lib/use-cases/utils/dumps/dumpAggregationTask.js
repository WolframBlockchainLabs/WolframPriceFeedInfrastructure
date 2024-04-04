function dumpAggregationTask(item) {
    return {
        id: item.id,
        type: item.type,
        status: item.status,
        context: item.context,
        error: item.error,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    };
}

export default dumpAggregationTask;
