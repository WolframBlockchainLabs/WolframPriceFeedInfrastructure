import { program } from 'commander';
import { AsyncValidator } from 'livr/async.js';
import './utils/validators/registerValidationRules.js';

class BaseCLIRunner {
    optionsValidationRules = {};

    argsValidationRules = {};

    constructor({ logger, sequelize, amqpClient, config }) {
        this.config = config;
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
        const validator = new AsyncValidator({
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

    async stop() {}
}

export default BaseCLIRunner;
