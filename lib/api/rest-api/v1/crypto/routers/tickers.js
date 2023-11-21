import express from 'express';
import controllers from '../controllers/index.js';

function initTickersRouter() {
    const router = express.Router();

    router.get('/', controllers.tickers.list);

    return router;
}

export default initTickersRouter;
