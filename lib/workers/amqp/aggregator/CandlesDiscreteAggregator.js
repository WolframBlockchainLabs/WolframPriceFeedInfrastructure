import AggregationTask from '#domain-model/entities/AggregationTask.js';
import DiscreteAggregationExchange from '#domain-model/entities/DiscreteAggregationExchange.js';
import DiscreteAggregationResult from '#domain-model/entities/DiscreteAggregationResult.js';
import Exchange from '#domain-model/entities/Exchange.js';
import DiscreteAggregation from '#use-cases/market-records/candle-sticks/DiscreteAggregation.js';
import dumpAggregationTask from '#use-cases/utils/dumps/dumpAggregationTask.js';
import dumpError from '#use-cases/utils/dumps/dumpError.js';
import { Op } from 'sequelize';
import BaseAggregatorWorker from './BaseAggregatorWorker.js';

class CandlesDiscreteAggregator extends BaseAggregatorWorker {
    async execute({ taskId, params }) {
        const task = await this.initiateTaskStatus(taskId);

        try {
            const results = await this.executeUseCase(params);

            await this.saveTaskResults({ task, params, results });

            await task.update({ status: AggregationTask.STATUS.COMPLETED });

            this.logger.debug({
                message: `Candles discrete aggregator completed successfully`,
                context: dumpAggregationTask(task),
            });
        } catch (error) {
            await task.update({
                status: AggregationTask.STATUS.ERROR,
                error: dumpError(error),
            });

            this.logger.error({
                message: `Candles discrete aggregator failed`,
                context: dumpAggregationTask(task),
            });
        }
    }

    async initiateTaskStatus(taskId) {
        const task = await AggregationTask.findOneOrFail({
            where: { id: taskId },
        });

        await task.update({ status: AggregationTask.STATUS.PROCESSING });

        return task;
    }

    async executeUseCase(params) {
        const discreteAggregationUseCase = new DiscreteAggregation({
            context: {
                maxDateDiff:
                    this.config.apiLimits.aggregations.asyncMaxDateDiff,
                stepSize: this.config.apiLimits.aggregations.asyncStepSize,
            },
        });

        return discreteAggregationUseCase.systemCall(params);
    }

    async saveTaskResults({ task, params, results }) {
        const formattedResults = results.data.pairs.map(
            ({ symbol, processedCount, count, candles }) => ({
                symbol,
                processedCount,
                count,
                rangeDateStart: params.rangeDateStart,
                rangeDateEnd: params.rangeDateEnd,
                timeframeMinutes: params.timeframeMinutes,
                candles,
                taskId: task.id,
            }),
        );

        const createdResults = await DiscreteAggregationResult.bulkCreate(
            formattedResults,
            { returning: true },
        );

        await this.setResultsAssociations(createdResults, params.exchangeNames);
    }

    async setResultsAssociations(createdResults, exchangeNames) {
        const exchanges = await Exchange.findAll({
            where: { name: { [Op.in]: exchangeNames } },
        });

        const joinTableData = exchanges.reduce((acc, exchange) => {
            const entries = createdResults.map((result) => ({
                discreteAggregationResultId: result.id,
                exchangeId: exchange.id,
            }));

            return acc.concat(entries);
        }, []);

        await DiscreteAggregationExchange.bulkCreate(joinTableData);
    }
}

export default CandlesDiscreteAggregator;
