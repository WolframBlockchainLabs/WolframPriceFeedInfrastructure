import express from 'express';
import { promisify } from 'util';
import { once } from 'events';
import { middleware, middlewareFactories } from './middleware/index.js';
import chista from './chista/chista.js';
import initApiV1Router from './v1/router.js';

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

        this.app.set('trust proxy', this.config.app.trustProxy);

        this.app.use(middlewareFactories.cls(this.clsNamespace, this.logger));
        this.app.use(middlewareFactories.cors(this.config.urls));

        this.app.use(middleware.json);
        this.app.use(middleware.helmet);
        this.app.use(middleware.metrics);

        this.app.use('/api/v1', initApiV1Router());

        return this;
    }

    async start(port) {
        this.server = this.app.listen(port);

        this.logger.info(
            `[${this.constructor.name}]: STARTING AT PORT [${port}]`,
        );

        return once(this.server, 'listening');
    }

    async stop() {
        if (!this.server) return;
        this.logger.info(`[${this.constructor.name}]: Closing Server`);

        try {
            await promisify(this.server.close.bind(this.server))();
        } catch (error) {
            this.logger.error({
                message: `[${this.constructor.name}]: Error Closing Server`,
                error,
            });
        }
    }

    getHTTPServer() {
        return this.server;
    }

    getExpressServer() {
        return this.app;
    }
}

export default RestApp;
