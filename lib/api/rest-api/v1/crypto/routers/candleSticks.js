import express from 'express';
import controllers from '../controllers/index.js';

function initCandleSticksRouter() {
    const router = express.Router();

    router.get('/', controllers.candleSticks.list);
    router.get('/aggregate', controllers.candleSticks.aggregate);

    return router;
}

export default initCandleSticksRouter;
