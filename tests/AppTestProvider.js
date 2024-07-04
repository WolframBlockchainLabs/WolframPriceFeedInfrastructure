import AppProvider from '../lib/AppProvider.js';

class AppTestProvider extends AppProvider {
    async start() {
        await super.start(this.getTestAppPort());
    }

    getExpressApp() {
        return this.restApp.getExpressServer();
    }

    getTestAppPort() {
        return this.config.app.testPort;
    }
}

export default AppTestProvider;
