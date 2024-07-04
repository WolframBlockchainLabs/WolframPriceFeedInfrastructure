import AppTestProvider from '../AppTestProvider.js';
import ArtilleryRunner from './infrastructure/ArtilleryRunner.cjs';
import StressTestDBManager from './infrastructure/StressTestDBManager.js';
import StressTestSeeder from './infrastructure/StressTestSeeder.js';

class AppLocalStressTestProvider extends AppTestProvider {
    build() {
        super.build();

        this.testDBManager = this.initTestDBManager({
            logger: this.logger,
            sequelize: this.sequelize,
            config: this.config,
        });

        this.stressLogger = super.initLogger(this.config);

        this.seeder = this.initSeeder({
            logger: this.stressLogger,
            sequelize: this.sequelize,
            config: this.config,
        });

        this.artillery = this.initArtillery(this.stressLogger);
    }

    async start() {
        await this.testDBManager.start();

        await super.start();

        await this.seeder.resetDatabase();
        await this.seeder.execute();

        await this.executeArtillery();

        await this.shutdown();
    }

    async shutdown() {
        await this.seeder.resetDatabase();

        await super.shutdown();

        await this.testDBManager.close();
    }

    async executeArtillery() {
        await this.artillery.execute({
            TEST_URL: this.config.stressTests.testUrl,
            TEST_ENV: this.config.stressTests.testEnv,
        });
    }

    initLogger() {
        return super.initLogger({
            logger: { ...this.config.logger, level: 'error' },
            app: { mode: 'stress-test' },
        });
    }

    initArtillery(logger) {
        return new ArtilleryRunner(logger);
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
            broadcast: () => {},
            publish: () => {},
            initConnection: () => {},
            closeConnection: () => {},
            sendToQueue: () => {},
            getChannel: () => ({
                addSetup: () => {},
            }),
        };
    }

    initSeeder({ logger, sequelize, config }) {
        return new StressTestSeeder({ logger, sequelize, config });
    }

    initTestDBManager({ logger, sequelize, config }) {
        return new StressTestDBManager({
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
        return `${this.config.db.database}_stress-test`;
    }
}

export default AppLocalStressTestProvider;
