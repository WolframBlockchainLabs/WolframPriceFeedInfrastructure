import express from 'express';
import controllers from '../controllers/index.js';

function initOrderBooksRouter() {
    const router = express.Router();

    router.get('/', controllers.orderBooks.list);

    return router;
}

export default initOrderBooksRouter;
