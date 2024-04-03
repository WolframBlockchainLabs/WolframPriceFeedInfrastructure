import express from 'express';
import controllers from '../controllers/index.js';

function initAggregationTasksRouter() {
    const router = express.Router();

    router.get('/:id', controllers.aggregationTasks.get);

    return router;
}

export default initAggregationTasksRouter;
