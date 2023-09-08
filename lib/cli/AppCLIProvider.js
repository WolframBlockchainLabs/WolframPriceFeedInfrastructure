import { program } from 'commander';
import BaseProvider from '../BaseProvider.js';

class AppCLIProvider extends BaseProvider {
    constructor(Runner) {
        super();

        this.runner = new Runner(this);
    }

    async start() {
        await super.start();

        program.action(this.runner.handler.bind(this.runner));
        await program.parseAsync(process.argv);
    }
}

export default AppCLIProvider;
