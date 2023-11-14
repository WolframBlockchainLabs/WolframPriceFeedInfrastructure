import AppTestProvider from '../AppTestProvider.js';
import ArtilleryRunner from './ArtilleryRunner.cjs';
import StressTestSeeder from './seeder/StressTestSeeder.js';

class AppStressTestProvider extends AppTestProvider {
    constructor(...args) {
        super(...args);

        this.seeder = this.initSeeder(this.getLogger());
        this.artillery = this.initArtillery(this.getLogger());
    }

    async start() {
        await super.start();

        await this.seeder.cleanup();
        await this.seeder.execute();

        await this.artillery.execute(this.getAppPort());
        await this.shutdown();
    }

    async shutdown() {
        await this.seeder.cleanup();

        await super.shutdown();
    }

    initSeeder(logger) {
        return new StressTestSeeder(logger);
    }

    initArtillery(logger) {
        return new ArtilleryRunner(logger);
    }
}

export default AppStressTestProvider;
