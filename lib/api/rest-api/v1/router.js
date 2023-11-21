import express from 'express';
import initCryptoRouter from './crypto/router.js';

function initApiV1Router() {
    const router = express.Router();

    router.use('/crypto', initCryptoRouter());

    return router;
}

export default initApiV1Router;
