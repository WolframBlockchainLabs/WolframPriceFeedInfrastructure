import express from 'express';
import initExchangesRouter from './routers/exchanges.js';
import initMarketsRouter from './routers/markets.js';
import initOrderBooksRouter from './routers/orderBooks.js';
import initTradesRouter from './routers/trades.js';
import initTickersRouter from './routers/tickers.js';
import initCandleSticksRouter from './routers/candleSticks.js';
import initExchangeRatesRouter from './routers/exchangeRates.js';
import initAggregationTasksRouter from './routers/aggregationTasks.js';

function initCryptoRouter() {
    const router = express.Router();

    router.use('/exchanges', initExchangesRouter());
    router.use('/markets', initMarketsRouter());

    router.use('/order-books', initOrderBooksRouter());
    router.use('/trades', initTradesRouter());
    router.use('/tickers', initTickersRouter());
    router.use('/candle-sticks', initCandleSticksRouter());
    router.use('/exchange-rates', initExchangeRatesRouter());

    router.use('/aggregation-tasks', initAggregationTasksRouter());

    return router;
}

export default initCryptoRouter;
