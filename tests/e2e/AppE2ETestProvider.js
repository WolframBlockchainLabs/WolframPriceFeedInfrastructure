import AppTestProvider from '../AppTestProvider.js';
import request from 'supertest';
import TestDBManager from '../TestDBManager.js';

class AppE2ETestProvider extends AppTestProvider {
    constructor(...args) {
        super(...args);

        this.request = request(this.getExpressApp());
    }

    async start() {
        await this.testDBManager.start();
    }

    async shutdown() {
        await this.testDBManager.close();

        await this.sequelize.close();
        this.ioRedisClient.disconnect();
    }

    async resetState() {
        await this.testDBManager.truncateAllTables();

        await this.ioRedisClient.flushall();
    }

    build() {
        super.build();

        this.testDBManager = this.initTestDBManager({
            logger: this.logger,
            sequelize: this.sequelize,
            config: this.config,
        });
    }

    initConfig(config) {
        return {
            ...config,
            app: {
                ...config.app,
                cacheEnabled: false,
            },
        };
    }

    initAMQPClient() {
        return {
            broadcast: jest.fn(),
            publish: jest.fn(),
            sendToQueue: jest.fn(),
        };
    }

    initTestDBManager({ logger, sequelize, config }) {
        return new TestDBManager({
            sequelize,
            logger,
            config,
            databaseName: this.getDatabaseName(),
        });
    }

    getSequelizeOptions(config) {
        return {
            ...config.db,
            database: this.getDatabaseName(),
        };
    }

    getDatabaseName() {
        return `${this.config.db.database}_test_${process.env.JEST_WORKER_ID}`;
    }
}

export default AppE2ETestProvider;
