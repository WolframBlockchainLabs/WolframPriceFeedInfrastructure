class AppTestProvider {
    constructor(appProvider) {
        this.appProvider = appProvider;
    }

    async start() {
        await this.appProvider.start(this.getAppPort());
    }

    async shutdown() {
        await this.appProvider.shutdown();
    }

    getLogger() {
        return this.appProvider.logger;
    }

    getConfig() {
        return this.appProvider.config;
    }

    getAppPort() {
        return this.getConfig().appTestPort;
    }
}

export default AppTestProvider;
