import { program } from 'commander';
import LIVR from 'livr/async.js';
import BaseProvider from '../../BaseProvider.js';
import './options_schema.js';

class AppCliProvider extends BaseProvider {
    optionsValidationRules = {};

    argsValidationRules = {};

    async start() {
        await super.start();

        program.action(this.handler.bind(this));
        await program.parseAsync(process.argv);
    }

    async handler(...args) {
        const rawOptions = program.opts();
        const rawArgs = Object.assign({}, args);

        const validatedData = await this.validate({
            options: rawOptions,
            args: rawArgs,
        });

        await this.process(validatedData);
    }

    async validate(data) {
        const validator = new LIVR.AsyncValidator({
            options: {
                nested_object: this.optionsValidationRules,
            },
            args: {
                nested_object: this.argsValidationRules,
            },
        });

        return validator.validate(data);
    }

    async process() {
        throw new Error('process method is not implemented');
    }
}

export default AppCliProvider;
