import aggregateCandleSticksController from './aggregate.js';
import aggregateDiscreteCandleSticksController from './aggregateDiscrete.js';
import listExchangeRatesController from './list.js';

const condleSticksControllers = {
    list: listExchangeRatesController,
    aggregate: aggregateCandleSticksController,
    aggregateDiscrete: aggregateDiscreteCandleSticksController,
};

export default condleSticksControllers;
