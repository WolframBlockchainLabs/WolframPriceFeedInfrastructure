import express from 'express';
import controllers from '../controllers/index.js';

function initExchangeRatesRouter() {
    const router = express.Router();

    router.get('/', controllers.exchangeRates.list);

    return router;
}

export default initExchangeRatesRouter;
