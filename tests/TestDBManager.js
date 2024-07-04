import { Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';
import initSequelize from '#infrastructure/sequelize/initSequelize.js';

class TestDBManager {
    constructor({ sequelize, logger, config, databaseName }) {
        this.mainSequelize = sequelize;
        this.logger = logger;
        this.config = config;
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
        this.workerSequelize = this.initWorkerSequelize(this.config.db);

        this.umzug = this.initUmzug({
            sequelize: this.mainSequelize,
            logger: this.logger,
        });
    }

    initWorkerSequelize(sequelizeOptions) {
        const sequelize = initSequelize(sequelizeOptions);

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
