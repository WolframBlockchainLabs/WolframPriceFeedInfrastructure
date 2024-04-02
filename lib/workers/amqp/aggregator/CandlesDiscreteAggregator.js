import DiscreteAggregation from '#use-cases/market-records/candle-sticks/DiscreteAggregation.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class CandlesDiscreteAggregator extends BaseAMQPWorker {
    async execute({ taskId, params }) {
        const task = await this.updateTaskStatus(taskId);

        const results = await this.executeUseCase(params);

        await this.saveTaskResults(task, results);

        this.logger.debug({
            message: `Candles discrete aggregator completed successfully`,
            context: {
                params,
            },
        });
    }

    async updateTaskStatus(taskId) {
        return taskId;
    }

    async executeUseCase(params) {
        const discreteAggregationUseCase = new DiscreteAggregation({
            context: {
                maxDateDiff:
                    this.config.apiLimits.aggregations.asyncMaxDateDiff,
                stepSize: this.config.apiLimits.aggregations.asyncStepSize,
            },
        });

        try {
            return await discreteAggregationUseCase.systemCall(params);
        } catch (error) {
            this.logger.error({
                message: `Candles discrete aggregator failed`,
                error,
            });
        }
    }

    async saveTaskResults(task, results) {
        return [task, results];
    }
}

export default CandlesDiscreteAggregator;
