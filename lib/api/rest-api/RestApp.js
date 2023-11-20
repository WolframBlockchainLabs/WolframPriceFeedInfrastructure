import express from 'express';
import routes from './routes/router.js';
import { promisify } from 'util';
import { once } from 'events';
import { middleware, middlewareFactories } from './middleware/index.js';
import chista from './chista/chista.js';

class RestApp {
    constructor({ logger, config, sequelize, clsNamespace }) {
        this.app = express();
        this.server = null;

        this.logger = logger;
        this.config = config;
        this.sequelize = sequelize;
        this.clsNamespace = clsNamespace;
    }

    init() {
        chista.defaultLogger = this.logger;

        if (this.config.appMode === 'prod') {
            this.app.set('trust proxy', 1);
        }

        this.app.use(middlewareFactories.cls(this.clsNamespace, this.logger));
        this.app.use(middlewareFactories.cors([this.config.mainUrl]));

        this.app.use(middleware.json);
        this.app.use(middleware.helmet);
        this.app.use(middleware.metrics);

        this.app.use('/api/v1', routes());

        return this;
    }

    async start(port) {
        this.server = this.app.listen(port);

        this.logger.info(`[RestApp] STARTING AT PORT [${port}]`);

        return once(this.server, 'listening');
    }

    async stop() {
        if (!this.server) return;
        this.logger.info('[RestApp] Closing server');

        return promisify(this.server.close.bind(this.server))();
    }

    getHTTPServer() {
        return this.server;
    }

    getExpressServer() {
        return this.app;
    }
}

export default RestApp;
