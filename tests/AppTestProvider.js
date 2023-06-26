import AppProvider from '../lib/AppProvider.js';

class AppTestProvider extends AppProvider {
    start() {
        return super.start(this.config.appTestPort);
    }

    async shutdown() {
        if (this.restApp) {
            await this.restApp.stop();
        }

        if (this.sequelize) {
            await this.sequelize.close();
        }

        if (this.logger) {
            this.logger.info('[App] Exit');
        }
    }

    getSequelizeOptions(config) {
        return config['test-db'];
    }

    subscribeToSystemSignals() {
        return this;
    }
}

export default AppTestProvider;
