import express     from 'express';
import controllers from './controllers/index.js';

const router = express.Router();

export default function init() {
    router.get('/news', controllers.news.list);
    router.get('/news/:slug', controllers.news.show);

    router.post('/contactRequests', controllers.contactRequests.create);

    router.get('/seo/*', controllers.seo.show);
    router.get('/seo', controllers.seo.list);

    return router;
}
