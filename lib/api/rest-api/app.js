import express       from 'express';
import middlewares   from './middlewares.js';
import routes        from './routes/router.js';
import { logger }    from './../../infrastructure/logger/logger.js';
import { promisify } from './../../../packages.js';

const level = 'application';
const app = express();

let server = null;

export function init() {
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1); // trust first proxy
    }

    app.use(middlewares.json);
    app.use(middlewares.clsMiddleware);
    app.use(middlewares.urlencoded);
    app.use(middlewares.cors);

    app.use('/storage', express.static('storage'));
    app.use('/api/v1',  routes());

    return app;
}

export function start({ appPort }) {
    server = app.listen(appPort, () => {
        const { port, address } = server.address();

        logger(level).info(`[RestApiApp] STARTING AT PORT [${port}] ADDRESS [${address}]`);
    });

    server.closeAsync = promisify(server.close);
}

export async function stop() {
    if (!server) return;

    logger(level).info('[RestApiApp] Closing server');

    await server.closeAsync();
}
