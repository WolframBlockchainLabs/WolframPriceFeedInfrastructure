import AppProvider from '../lib/AppProvider.js';

class AppTestProvider extends AppProvider {
    async start() {
        await super.start(this.getTestAppPort());
    }

    getSequelizeOptions(config) {
        return config['test-db'];
    }

    getExpressApp() {
        return this.restApp.getExpressServer();
    }

    getTestAppPort() {
        return this.config.appTestPort;
    }
}

export default AppTestProvider;
