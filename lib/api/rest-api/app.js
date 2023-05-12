// import fs            from 'fs';
// import https         from 'https';
import express       from 'express';
import middlewares   from './middlewares.js';
// import adminRotes    from './admin/router.js';
// import mainRoutes    from './main/router.js';
import { logger }    from './../../infrastructure/logger/logger.js';
import { promisify } from './../../../packages.js';

const level = 'application';
const app = express();

let server = null;

// eslint-disable-next-line no-unused-vars
export function init({ sequelize }) {
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1); // trust first proxy
    }

    app.use(middlewares.json);
    app.use(middlewares.clsMiddleware);
    app.use(middlewares.urlencoded);
    app.use(middlewares.cors);
    // app.use(middlewares.sequelizeLang);
    // app.use(middlewares.metrics);

    app.use('/storage', express.static('storage'));
    // app.use('/admin-api/v1',  adminRotes({ sequelize }));
    // app.use('/api/v1',  mainRoutes());

    return app;
}

export function start({ appPort }) {
    // const securedApp = secure ? useHttps(app) : app;


    server = app.listen(appPort, () => {
        const { port, address } = server.address();

        console.log(`[RestApiApp] STARTING AT PORT [${port}] ADDRESS [${address}]`);

        // logger(level).info(`[RestApiApp] STARTING AT PORT [${port}] ADDRESS [${address}]`);
    });

    server.closeAsync = promisify(server.close);
}

export async function stop() {
    if (!server) return;

    logger(level).info('[RestApiApp] Closing server');

    await server.closeAsync();
}

// function useHttps(application) {
//     const httpsOptions = {
//         key  : fs.readFileSync('./certs/localhost-key.pem'),
//         cert : fs.readFileSync('./certs/localhost.pem')
//     };

//     return https.createServer(httpsOptions, application);
// }
