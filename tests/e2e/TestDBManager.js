import initModels from '../../lib/infrastructure/sequelize/initModels.js';
import { SequelizeStorage, Umzug } from 'umzug';
import { Sequelize } from 'sequelize';

class TestDBManager {
    constructor({ sequelize, logger, testDBConfig, databaseName }) {
        this.mainSequelize = sequelize;
        this.logger = logger;

        this.testDBConfig = testDBConfig;
        this.databaseName = databaseName;

        this.build();
    }

    async start() {
        await this.createWorkerTestDatabase();
        await this.runMigrations();
    }

    async close() {
        await this.workerSequelize.close();
    }

    async createWorkerTestDatabase() {
        if (!process.env.JEST_WORKER_ID) return;

        const dbExists = await this.workerSequelize.query(
            'SELECT 1 FROM pg_database WHERE datname = $databaseName',
            {
                bind: { databaseName: this.databaseName },
                type: this.workerSequelize.QueryTypes.SELECT,
            },
        );

        if (dbExists.length === 0) {
            await this.workerSequelize.query(
                `CREATE DATABASE "${this.databaseName}"`,
            );
        }
    }

    async runMigrations() {
        return this.umzug.up();
    }

    async revertMigrations() {
        return this.umzug.down({ to: 0 });
    }

    async truncateAllTables() {
        const modelsToTruncate = Object.values(
            this.mainSequelize.models,
        ).filter((model) => model.name !== 'SequelizeMeta');

        const truncationPromises = Object.values(modelsToTruncate).map(
            async (model) => {
                await this.mainSequelize.query(
                    `TRUNCATE TABLE "${model.tableName}" RESTART IDENTITY CASCADE;`,
                );
            },
        );

        return Promise.all(truncationPromises);
    }

    build() {
        this.workerSequelize = this.initDB(this.testDBConfig);

        this.umzug = this.initUmzug({
            sequelize: this.mainSequelize,
            logger: this.logger,
        });
    }

    initDB(testDBConfig) {
        const { sequelize } = initModels(testDBConfig);

        return sequelize;
    }

    initUmzug({ sequelize, logger }) {
        return new Umzug({
            migrations: {
                glob: 'migrations/*.cjs',
                resolve: ({ name, path, context }) => {
                    const migration = require(path || '');
                    return {
                        name,
                        up: async () => migration.up(context, Sequelize),
                        down: async () => migration.down(context, Sequelize),
                    };
                },
            },
            context: sequelize.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize }),
            logger,
        });
    }
}

export default TestDBManager;
