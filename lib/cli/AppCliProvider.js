import { program } from 'commander';
import AppProvider from '../AppProvider.js';

class AppCliProvider extends AppProvider {
    constructor(handle) {
        super();

        program.action(handle);
    }

    async start() {
        program.parseAsync(process.argv);
    }

    subscribeToSystemSignals() {
        return this;
    }
}

export default AppCliProvider;
