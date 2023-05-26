import express     from 'express';
import controllers from './controllers/index.js';

const router = express.Router();

export default function init() {
    router.get('/exchanges/:exchangeName/markets/:symbol/orderBooks', controllers.orderBook.list);


    return router;
}
