import { AGGREGATOR_QUEUES } from '#constants/rabbimqQueues.js';
import AggregationTask from '#domain-model/entities/AggregationTask.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';
import dumpAggregationTask from '#use-cases/utils/dumps/dumpAggregationTask.js';

class CreateDiscreteAggregationTask extends BaseUseCase {
    validationRules = {
        symbols: ['required', { list_of: ['not_null', 'not_empty', 'string'] }],
        exchangeNames: [
            'required',
            { list_of: ['not_null', 'not_empty', 'string'] },
        ],
        rangeDateStart: [
            'required',
            'not_empty',
            'iso_timestamp',
            {
                date_compare:
                    this.config.apiLimits.aggregations.asyncMaxDateDiff,
            },
        ],
        rangeDateEnd: [
            'required',
            'not_empty',
            'iso_timestamp',
            {
                date_compare:
                    this.config.apiLimits.aggregations.asyncMaxDateDiff,
            },
        ],
        timeframeMinutes: [
            'positive_integer',
            { max_number: 32768 },
            { default: 60 },
        ],
    };

    async execute(params) {
        const newTask = await AggregationTask.create({
            type: AggregationTask.TYPE.CANDLES_DISCRETE_AGGREGATION,
            context: params,
        });

        await this.amqpClient.publish(AGGREGATOR_QUEUES.candleStick.discrete, {
            taskId: newTask.id,
            params,
        });

        return {
            data: dumpAggregationTask(newTask),
        };
    }
}

export default CreateDiscreteAggregationTask;
