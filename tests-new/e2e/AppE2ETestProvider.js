import initModels from '../../lib/infrastructure/sequelize/initModels.js';
import AppTestProvider from '../AppTestProvider.js';
import request from 'supertest';
import { exec } from 'child_process';
import util from 'util';
import { SequelizeStorage, Umzug } from 'umzug';

class AppE2ETestProvider extends AppTestProvider {
    constructor(...args) {
        super(...args);

        this.request = request(this.getExpressApp());
        this.execAsync = util.promisify(exec);
    }

    build() {
        super.build();

        this.umzug = this.initUmzug(this.sequelize);
    }

    async start() {
        await this.createWorkerTestDatabase();

        await this.runMigrations();
    }

    async createWorkerTestDatabase() {
        if (!process.env.JEST_WORKER_ID) return;

        const { sequelize } = initModels(this.config['test-db']);
        const databaseName = this.getDatabaseName();

        const dbExists = await sequelize.query(
            'SELECT 1 FROM pg_database WHERE datname = $databaseName',
            {
                bind: { databaseName },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        if (dbExists.length === 0) {
            await sequelize.query(`CREATE DATABASE "${databaseName}"`);
        }

        await sequelize.close();
    }

    async runMigrations() {
        return this.umzug.up();
    }

    initUmzug(sequelize) {
        return new Umzug({
            migrations: { glob: 'migrations/*.js' },
            context: sequelize.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize }),
            logger: console,
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
