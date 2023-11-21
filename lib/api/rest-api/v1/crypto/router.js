import express from 'express';
import initExchangesRouter from './routers/exchanges.js';
import initMarketsRouter from './routers/markets.js';
import initOrderBooksRouter from './routers/orderBooks.js';
import initTradesRouter from './routers/trades.js';
import initTickersRouter from './routers/tickers.js';
import initCandleSticksRouter from './routers/candleSticks.js';
import initExchangeRatesRouter from './routers/exchangeRates.js';

function initCryptoRouter() {
    const router = express.Router();

    router.use('/exchanges', initExchangesRouter());
    router.use('/markets', initMarketsRouter());

    router.use('/orderBooks', initOrderBooksRouter());
    router.use('/trades', initTradesRouter());
    router.use('/tickers', initTickersRouter());
    router.use('/candleSticks', initCandleSticksRouter());
    router.use('/exchangeRates', initExchangeRatesRouter());

    return router;
}

export default initCryptoRouter;
