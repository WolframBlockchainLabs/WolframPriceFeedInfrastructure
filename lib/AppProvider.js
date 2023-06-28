import RestApp from './api/rest-api/RestApp.js';
import WSApp from './api/ws-api/WSApp.js';
import initModels from './domain-model/initModels.js';
import BaseUseCase from './use-cases/BaseUseCase.js';
import config from './config.cjs';
import clsNamespace from './clsNamespace.js';
import winstonLoggerFactory from './infrastructure/logger/winstonLoggerFactory.js';

class AppProvider {
    config = config;

    sequelize = null;

    restApp = null;

    wsApp = null;

    logger = null;

    constructor() {
        this.build();

        this.subscribeToSystemSignals();
    }

    async start(port) {
        await this.restApp.start(port || this.config.appPort);

        await this.wsApp.start(this.restApp.getHTTPServer());
    }

    async shutdown() {
        if (this.restApp) {
            await this.restApp.stop();
        }

        if (this.sequelize) {
            await this.sequelize.close();
        }

        if (this.logger) {
            this.logger.info('[App] Exit');
        }

        process.exit(0);
    }

    build() {
        this.logger = this.initLogger(this.config);

        this.sequelize = this.initDb(this.config);

        this.restApp = this.initRestApp({
            sequelize: this.sequelize,
            logger: this.logger,
            config: this.config,
        });

        this.wsApp = this.initWSApp({
            logger: this.logger,
            config: this.config,
        });

        this.initUseCases({
            sequelize: this.sequelize,
            appConfig: this.config,
        });
    }

    initRestApp({ sequelize, logger, config }) {
        const restApp = new RestApp({ sequelize, logger, config });

        return restApp.init();
    }

    initWSApp({ logger, config }) {
        return new WSApp({ logger, config });
    }

    initLogger(config) {
        const logger = winstonLoggerFactory({
            ...config.logger,
            clsConfig: {
                namespase: clsNamespace,
                contextKey: 'traceID',
            },
        });

        logger.info(`[App] Init Mode: ${config.appMode}`);

        return logger;
    }

    initDb(config) {
        const sequelizeOptions = this.getSequelizeOptions(config);
        const { sequelize } = initModels(sequelizeOptions);

        return sequelize;
    }

    initUseCases({ sequelize, config }) {
        BaseUseCase.setSequelizeInstance(sequelize);
        BaseUseCase.setAppConfig(config);
    }

    getSequelizeOptions(config) {
        return config.db;
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
}

export default AppProvider;
