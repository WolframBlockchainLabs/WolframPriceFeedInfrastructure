import * as api from './api/rest-api/app.js';
import * as DomainModel from './domain-model/index.js';
import UseCaseBase from './use-cases/Base.js';
import config from './config.cjs';
import clsNamespace from './clsNamespace.js';
import winstonLoggerFactory from './infrastructure/logger/winstonLoggerFactory.js';

export default class AppProvider {
    config = null;

    sequelize = null;

    notificator = null;

    api = null;

    logger = null;

    dbConfig = {};

    static create() {
        return new this();
    }

    initApp() {
        this.config = config;
        this.api = api;

        this.initLogger();
        this.initDb();
        this.initUseCases();
        this.subscribeToSystemSignals();

        return this;
    }

    async initLogger() {
        this.logger = winstonLoggerFactory({
            ...config.logger,
            clsConfig: {
                namespase: clsNamespace,
                contextKey: 'traceID',
            },
        });

        this.logger.info(`[App] Init Mode: ${process.env.MODE}`);
    }

    start(params = {}) {
        this.api.init(this.logger);
        this.api.start({
            appPort: this.config.appPort,
            secure: this.config.https,
            ...params,
        });
    }

    initDb() {
        DomainModel.setLogger(this.logger);

        const dbMode = process.env.MODE === 'application' ? 'db' : 'test-db';

        const { sequelize } = DomainModel.initModels(
            this.config[dbMode],
            this.dbConfig,
        );

        this.sequelize = sequelize;
    }

    initUseCases() {
        UseCaseBase.setSequelizeInstanse(this.sequelize);
        UseCaseBase.setAppConfig(this.config);
        UseCaseBase.setNotificator(this.notificator);
    }

    subscribeToSystemSignals() {
        process.on('SIGTERM', async () => {
            this.logger.info('[App] SIGTERM signal catched');

            await this.shutdown();
        });

        process.on('SIGINT', async () => {
            this.logger.info('[App] SIGINT signal catched');

            await this.shutdown();
        });

        process.on('unhandledRejection', (error) => {
            console.error(error);

            if (this.logger) {
                this.logger.emerg({
                    type: 'UnhandledRejection',
                    error: error.stack,
                });
            }
        });

        process.on('uncaughtException', (error) => {
            console.error(error);

            if (this.logger) {
                this.logger.emerg({
                    type: 'UncaughtException',
                    error: error.stack,
                });
            }
        });
    }

    async shutdown() {
        if (this.app) {
            await this.app.stop();
        }

        if (this.sequelize) {
            await this.sequelize.close();
        }

        if (this.logger) {
            this.logger.info('[App] Exit');
        }

        process.exit(0);
    }
}
