import config from '#configs/systemConfig.cjs';
import AppLocalStressTestProvider from './AppLocalStressTestProvider.js';

class AppRemoteStressTestProvider extends AppLocalStressTestProvider {
    build() {
        this.config = this.initConfig(config);

        this.stressLogger = super.initLogger(this.config);

        this.artillery = this.initArtillery(this.stressLogger);
    }

    async start() {
        await this.executeArtillery();
    }
}

export default AppRemoteStressTestProvider;
