class AppTestProvider {
    constructor(appProvider) {
        this.appProvider = appProvider;
    }

    async start() {
        await this.appProvider.start();
    }

    async shutdown() {
        await this.appProvider.shutdown();
    }
}

export default AppTestProvider;
