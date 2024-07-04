import AggregationTask from '#domain-model/entities/AggregationTask.js';
import BaseFactory from './BaseFactory.js';

class AggregationTaskFactory extends BaseFactory {
    async create(type = AggregationTask.TYPE.CANDLES_DISCRETE_AGGREGATION) {
        return AggregationTask.create({ type });
    }
}

export default AggregationTaskFactory;
