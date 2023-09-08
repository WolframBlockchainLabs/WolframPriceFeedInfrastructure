import { program } from 'commander';
import LIVR from 'livr/async.js';

class BaseCLIRunner {
    optionsValidationRules = {};

    argsValidationRules = {};

    constructor({ logger, sequelize, amqpClient }) {
        this.logger = logger;
        this.sequelize = sequelize;
        this.amqpClient = amqpClient;
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

export default BaseCLIRunner;
