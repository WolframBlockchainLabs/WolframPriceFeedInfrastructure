import express     from 'express';
import controllers from './controllers/index.js';

const router = express.Router();

export default function init() {
    router.get('/markets/:marketId/orderBooks', controllers.orderBook.list);

    return router;
}
