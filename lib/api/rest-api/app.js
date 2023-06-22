import express from 'express';
import middlewares from './middlewares.js';
import routes from './routes/router.js';
import { promisify } from 'util';

let apiLogger = null;
const app = express();

let server = null;

export function init(logger) {
    apiLogger = logger;

    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1); // trust first proxy
    }

    app.use(middlewares.json);
    app.use(middlewares.clsMiddleware);
    app.use(middlewares.urlencoded);
    app.use(middlewares.cors);
    app.use(middlewares.metrics);

    app.use('/storage', express.static('storage'));
    app.use('/api/v1', routes());

    return app;
}

export function start({ appPort }) {
    server = app.listen(appPort, () => {
        const { port, address } = server.address();

        apiLogger.info(
            `[RestApiApp] STARTING AT PORT [${port}] ADDRESS [${address}]`,
        );
    });
}

export async function stop() {
    if (!server) return;

    apiLogger.info('[RestApiApp] Closing server');

    return promisify(server.close)();
}
