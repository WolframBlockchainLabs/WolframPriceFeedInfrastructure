import AppProvider from '../lib/AppProvider.js';

class AppTestProvider extends AppProvider {
    start() {
        return super.start(this.config.appTestPort);
    }

    getSequelizeOptions(config) {
        return config['test-db'];
    }

    subscribeToSystemSignals() {
        return this;
    }
}

export default AppTestProvider;
