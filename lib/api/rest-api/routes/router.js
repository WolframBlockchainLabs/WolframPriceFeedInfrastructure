import express     from 'express';
import controllers from './controllers/index.js';

const router = express.Router();

export default function init() {
    router.get('/exchanges/:exchangeName/markets/:symbol/orderBooks', controllers.orderBook.list);
    router.get('/exchanges/:exchangeName/markets/:symbol/trades', controllers.trade.list);
    router.get('/exchanges/:exchangeNames/markets/:symbol/tickers', controllers.ticker.list);
    router.get('/exchanges/:exchangeName/markets/:symbol/candleSticks', controllers.candleStick.list);
    router.get('/exchanges', controllers.exchange.list);

    return router;
}
