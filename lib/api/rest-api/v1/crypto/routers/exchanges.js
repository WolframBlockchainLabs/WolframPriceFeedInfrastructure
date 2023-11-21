import express from 'express';
import controllers from '../controllers/index.js';

function initExchangesRouter() {
    const router = express.Router();

    router.get('/', controllers.exchanges.list);

    return router;
}

export default initExchangesRouter;
