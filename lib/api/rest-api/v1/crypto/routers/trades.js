import express from 'express';
import controllers from '../controllers/index.js';

function initTradesRouter() {
    const router = express.Router();

    router.get('/', controllers.trades.list);

    return router;
}

export default initTradesRouter;
