import { program } from 'commander';
import BaseProvider from '../BaseProvider.js';

class AppCliProvider extends BaseProvider {
    constructor(handle) {
        super();

        program.action(handle);
    }

    async start() {
        await super.start();

        program.parseAsync(process.argv);
    }
}

export default AppCliProvider;
