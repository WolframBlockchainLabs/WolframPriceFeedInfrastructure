import initModels from '../domain-model/initModels.js';
import config from '../config.cjs';
import clsNamespace from '../clsNamespace.js';
import winstonLoggerFactory from '../infrastructure/logger/winstonLoggerFactory.js';
import AMQPClient from '../infrastructure/amqp/AMQPClient.js';

class BaseProvider {
    config = config;

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
    }

    build() {
        this.logger = this.initLogger(this.config);

        this.sequelize = this.initDb(this.config);

        this.amqpClient = this.initAMQPClient(this.config);
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

    initAMQPClient(config) {
        return new AMQPClient(config.rabbitmq);
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

export default BaseProvider;
