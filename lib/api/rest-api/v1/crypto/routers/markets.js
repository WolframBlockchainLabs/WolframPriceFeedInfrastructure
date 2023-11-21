import express from 'express';
import controllers from '../controllers/index.js';

function initMarketsRouter() {
    const router = express.Router();

    router.get('/', controllers.markets.list);

    return router;
}

export default initMarketsRouter;
