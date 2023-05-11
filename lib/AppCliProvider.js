import { program } from 'commander';
import AppProvider from './AppProvider.js';

export default class AppCliProvider extends AppProvider {
    initApp(handle) {
        this.dbConfig = { maxRetries: 40 };

        program.action(handle);

        return super.initApp();
    }

    start() {
        return program.parseAsync(process.argv);
    }

    subscribeToSystemSignals() {
        return this;
    }
}
