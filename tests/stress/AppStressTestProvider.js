import AppTestProvider from '../AppTestProvider.js';
import StressTestSeeder from './StressTestSeeder.js';

class AppStressTestProvider extends AppTestProvider {
    build() {
        super.build();

        this.seeder = this.initSeeder(this.logger);
    }

    async start() {
        await super.start();

        await this.seeder.cleanup();
        await this.seeder.execute();
    }

    async shutdown() {
        await this.seeder.cleanup();

        await super.shutdown();
    }

    initSeeder(logger) {
        return new StressTestSeeder(logger);
    }
}

export default AppStressTestProvider;
