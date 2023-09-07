import { program } from 'commander';
import LIVR from 'livr/async.js';
import BaseProvider from '../../BaseProvider.js';
import './options_schema.js';

class AppCliProvider extends BaseProvider {
    validationRules = null;

    async start() {
        await super.start();

        program.action(this.handler.bind(this));
        await program.parseAsync(process.argv);
    }

    async handler() {
        const rawOptions = program.opts();
        const options = await this.validateOptions(rawOptions);

        await this.process(options);
    }

    async validateOptions(rawOptions) {
        if (!this.validationRules) {
            throw new Error('validationRules are not defined');
        }

        const validator = new LIVR.AsyncValidator(this.validationRules);

        return validator.validate(rawOptions);
    }

    async process() {
        throw new Error('process method is not implemented');
    }
}

export default AppCliProvider;
