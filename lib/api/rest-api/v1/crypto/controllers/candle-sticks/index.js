import aggregateCandleSticksController from './aggregate.js';
import listExchangeRatesController from './list.js';

const condleSticksControllers = {
    list: listExchangeRatesController,
    aggregate: aggregateCandleSticksController,
};

export default condleSticksControllers;
