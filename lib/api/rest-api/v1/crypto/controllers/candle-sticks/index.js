import aggregateCandleSticksController from './aggregate.js';
import aggregateDiscreteCandleSticksController from './aggregateDiscrete.js';
import createDiscreteAggregationTaskController from './createDiscreteAggregationTask.js';
import getDiscreteAggregationTaskResultsController from './getDiscreteAggregationTaskResults.js';
import listExchangeRatesController from './list.js';
import listDiscreteAggregationTaskResultsController from './listDiscreteAggregationTaskResults.js';

const candleSticksControllers = {
    list: listExchangeRatesController,
    aggregate: aggregateCandleSticksController,
    aggregateDiscrete: aggregateDiscreteCandleSticksController,
    createDiscreteAggregationTask: createDiscreteAggregationTaskController,
    getDiscreteAggregationTaskResults:
        getDiscreteAggregationTaskResultsController,
    listDiscreteAggregationTaskResults:
        listDiscreteAggregationTaskResultsController,
};

export default candleSticksControllers;
