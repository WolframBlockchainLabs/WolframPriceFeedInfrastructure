import AggregationTask from '#domain-model/entities/AggregationTask.js';
import DiscreteAggregationResult from '#domain-model/entities/DiscreteAggregationResult.js';
import Exchange from '#domain-model/entities/Exchange.js';
import { Op } from 'sequelize';
import AggregationTaskFactory from '../factories/AggregationTaskFactory.js';
import BaseStory from './BaseStory.js';
import DiscreteAggregationExchange from '#domain-model/entities/DiscreteAggregationExchange.js';
import ExchangeFactory from '../factories/ExchangeFactory.js';

class DiscreteCandlesAggregationTaskStory extends BaseStory {
    constructor(...args) {
        super(...args);

        this.exchangeFactory = new ExchangeFactory(this.appProvider);

        this.aggregationTaskFactory = new AggregationTaskFactory(
            this.appProvider,
        );
    }

    async setupCompletedTask(params, results) {
        await this.setupExchanges(params.exchangeNames);

        const task = await AggregationTask.create({
            type: AggregationTask.TYPE.CANDLES_DISCRETE_AGGREGATION,
            status: AggregationTask.STATUS.COMPLETED,
        });

        await this.saveTaskResults({ task, params, results });

        return task;
    }

    async setupExchanges(exchangeNames) {
        const bulkData = exchangeNames.map((exchangeName) => ({
            externalExchangeId: exchangeName.toLowerCase(),
            name: exchangeName,
        }));

        await this.exchangeFactory.bulkCreate(bulkData);
    }

    async saveTaskResults({ task, params, results }) {
        const formattedResults = results.pairs.map(
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

export default DiscreteCandlesAggregationTaskStory;
