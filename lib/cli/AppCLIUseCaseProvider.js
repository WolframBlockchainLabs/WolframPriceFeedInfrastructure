import { program } from 'commander';
import BaseProvider from '../BaseProvider.js';

class AppCLIUseCaseProvider extends BaseProvider {
    constructor(UseCase) {
        super();

        this.useCase = new UseCase({ context: {} });
    }

    async start() {
        await super.start();

        program.action(this.handler.bind(this));
        await program.parseAsync(process.argv);

        await this.shutdown();
    }

    async handler() {
        const rawOptions = program.opts();

        await this.useCase.run(rawOptions);
    }
}

export default AppCLIUseCaseProvider;
