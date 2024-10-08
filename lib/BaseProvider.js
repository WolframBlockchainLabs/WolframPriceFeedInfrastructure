import initModels from '#infrastructure/sequelize/initModels.js';
import config from '#configs/systemConfig.cjs';
import clsNamespace from '#infrastructure/namespaces/app.js';
import winstonLoggerFactory from '#infrastructure/logger/winstonLoggerFactory.js';
import AMQPClient from '#infrastructure/amqp/AMQPClient.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';
import initIORedisClient from '#infrastructure/ioredis/initIORedisClient.js';

class BaseProvider {
    clsNamespace = clsNamespace;

    config = null;

    sequelize = null;

    amqpClient = null;

    logger = null;

    constructor() {
        this.build();

        this.subscribeToSystemSignals();
    }

    async start() {
        await this.amqpClient.initConnection();
    }

    async shutdown() {
        await this.amqpClient.closeConnection();
        await this.sequelize.close();
        this.ioRedisClient.disconnect();

        this.logger.info('[App] Exit');

        process.exit(0);
    }

    async terminationHandler() {
        setTimeout(
            this.forceTerminationHandler.bind(this),
            this.config.app.terminationTimeout,
        );

        try {
            await this.shutdown();
        } catch (error) {
            this.logger.error({
                message: `[${this.constructor.name}]: Error Closing Provider`,
                error,
            });
        } finally {
            this.forceTerminationHandler();
        }
    }

    forceTerminationHandler() {
        this.logger.warning(
            `[${this.constructor.name}]: Forcefully Terminating the Process`,
        );

        process.exit(1);
    }

    build() {
        this.config = this.initConfig(config);

        this.logger = this.initLogger(this.config);

        this.sequelize = this.initDB(this.config);

        this.ioRedisClient = this.initRedis(this.config);

        this.amqpClient = this.initAMQPClient(this.config);

        this.initUseCases();
    }

    initConfig(config) {
        return config;
    }

    initLogger(config) {
        const logger = winstonLoggerFactory({
            ...config.logger,
            clsConfig: {
                namespase: this.clsNamespace,
                contextKey: 'traceID',
            },
        });

        logger.info(`[App] Init Mode: ${config.app.mode}`);

        return logger;
    }

    initDB(config) {
        const sequelizeOptions = this.getSequelizeOptions(config);
        const sequelize = initModels({ sequelizeOptions, config });

        return sequelize;
    }

    initRedis(config) {
        return initIORedisClient(config.redis);
    }

    initAMQPClient(config) {
        return new AMQPClient(config.rabbitmq);
    }

    initUseCases() {
        BaseUseCase.setAppProvider(this);
    }

    getSequelizeOptions(config) {
        return config.db;
    }

    subscribeToSystemSignals() {
        process.on('SIGTERM', async () => {
            this.logger.info('[App] SIGTERM signal catched');

            await this.terminationHandler();
        });

        process.on('SIGINT', async () => {
            this.logger.info('[App] SIGINT signal catched');

            await this.terminationHandler();
        });

        process.on('unhandledRejection', async (error) => {
            this.logger.emerg({
                type: 'UnhandledRejection',
                error,
            });

            await this.terminationHandler();
        });

        process.on('uncaughtException', async (error) => {
            this.logger.emerg({
                type: 'UncaughtException',
                error,
            });

            await this.terminationHandler();
        });
    }
}

export default BaseProvider;
