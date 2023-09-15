import AppProvider from '../lib/AppProvider.js';

class AppTestProvider extends AppProvider {
    async start() {
        await super.start(this.config.appTestPort);
    }

    getSequelizeOptions(config) {
        return config['test-db'];
    }
}

export default AppTestProvider;
