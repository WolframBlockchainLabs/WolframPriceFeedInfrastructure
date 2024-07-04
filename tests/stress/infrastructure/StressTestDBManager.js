import { Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';
import { createRequire } from 'module';
import TestDBManager from '#tests/TestDBManager.js';

const require = createRequire(import.meta.url);

class StressTestDBManager extends TestDBManager {
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

export default StressTestDBManager;
