import { program } from 'commander';
import BaseProvider from '../BaseProvider.js';

class AppCLIUseCaseProvider extends BaseProvider {
    constructor(UseCase) {
        super();

        this.UseCase = UseCase;
        this.useCase = new UseCase({ context: {} });
    }

    async start(params) {
        await super.start();

        program.action(this.handler.bind(this, params));
        await program.parseAsync(process.argv);

        await this.shutdown();
    }

    async handler(params) {
        const rawOptions = program.opts();

        await this.useCase.run({ ...params, ...rawOptions });

        this.logger.info(`[${this.UseCase.name}] executed successfully`);
    }
}

export default AppCLIUseCaseProvider;
