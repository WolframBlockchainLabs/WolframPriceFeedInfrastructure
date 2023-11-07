import express from 'express';
import controllers from './controllers/index.js';

const router = express.Router();

function init() {
    router.get(
        '/exchanges/:exchangeNames/markets/:symbol/orderBooks',
        controllers.orderBook.list,
    );
    router.get(
        '/exchanges/:exchangeNames/markets/:symbol/trades',
        controllers.trade.list,
    );
    router.get(
        '/exchanges/:exchangeNames/markets/:symbol/tickers',
        controllers.ticker.list,
    );
    router.get(
        '/exchanges/:exchangeNames/markets/:symbol/candleSticks',
        controllers.candleStick.list,
    );
    router.get(
        '/exchanges/:exchangeNames/markets/:symbol/exchangeRates',
        controllers.exchangeRates.list,
    );

    router.get('/candleSticks/aggregate', controllers.candleStick.aggregate);

    router.get('/exchanges', controllers.exchange.list);
    router.get('/markets', controllers.markets.list);

    return router;
}

export default init;
