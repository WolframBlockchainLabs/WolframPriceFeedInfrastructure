import express from 'express';
import controllers from '../controllers/index.js';

function initCandleSticksRouter() {
    const router = express.Router();

    router.get('/', controllers.candleSticks.list);
    router.get('/aggregate', controllers.candleSticks.aggregate);
    router.get(
        '/aggregate-discrete',
        controllers.candleSticks.aggregateDiscrete,
    );
    router.get(
        '/aggregate-discrete/results/:id',
        controllers.candleSticks.getDiscreteAggregationTaskResults,
    );
    router.get(
        '/aggregate-discrete/results',
        controllers.candleSticks.listDiscreteAggregationTaskResults,
    );

    router.post(
        '/aggregate-discrete',
        controllers.candleSticks.createDiscreteAggregationTask,
    );

    return router;
}

export default initCandleSticksRouter;
