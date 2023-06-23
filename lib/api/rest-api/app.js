import express from 'express';
import middleware from './middlewares.js';
import routes from './routes/router.js';
import { promisify } from 'util';
import { once } from 'events';
import chista from './chista/chista.js';

class RestApp {
    constructor({ logger, config, sequelize }) {
        this.app = express();

        this.logger = logger;
        this.config = config;
        this.sequelize = sequelize;
    }

    init() {
        chista.defaultLogger = this.logger;

        if (this.config.appMode === 'prod') {
            this.app.set('trust proxy', 1);
        }

        this.app.use(middleware.json);
        this.app.use(middleware.clsMiddleware);
        this.app.use(middleware.urlencoded);
        this.app.use(middleware.cors);
        this.app.use(middleware.metrics);

        this.app.use('/api/v1', routes());

        return this;
    }

    async start(port) {
        const server = this.app.listen(port);

        this.logger.info(`[RestApp] STARTING AT PORT [${port}]`);

        return once(server, 'listening');
    }

    async stop() {
        if (!this.server) return;
        this.logger.info('[RestApp] Closing server');

        return promisify(this.server.close)();
    }

    getExpressApp() {
        return this.app;
    }
}

export default RestApp;
