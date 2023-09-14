import AppCLIProvider from './AppCLIProvider.js';

class AppFiniteCLIProvider extends AppCLIProvider {
    async start() {
        await super.start();

        await this.shutdown();
    }
}

export default AppFiniteCLIProvider;
