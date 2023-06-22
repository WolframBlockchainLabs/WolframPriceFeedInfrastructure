import AppProvider from '../lib/AppProvider.js';

export default class AppTestProvider extends AppProvider {
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
