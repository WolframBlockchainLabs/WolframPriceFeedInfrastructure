import AppTestProvider from '../AppTestProvider.js';
import request from 'supertest';
import TestDBManager from './TestDBManager.js';

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
        });
    }

    initTestDBManager({ logger, sequelize }) {
        return new TestDBManager({
            sequelize,
            logger,
            testDBConfig: this.config['test-db'],
            databaseName: this.getDatabaseName(),
        });
    }

    getSequelizeOptions(config) {
        return {
            ...config['test-db'],
            ...(process.env.JEST_WORKER_ID && {
                database: this.getDatabaseName(),
            }),
        };
    }

    getDatabaseName() {
        return `${this.config['test-db'].database}_${process.env.JEST_WORKER_ID}`;
    }
}

export default AppE2ETestProvider;
