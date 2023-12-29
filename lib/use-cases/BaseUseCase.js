import { Validator } from 'livr';
import ChistaServiceBase from '#infrastructure/chista/ChistaServiceBase.cjs';
import './utils/registerValidationRules.js';

class BaseUseCase extends ChistaServiceBase {
    static setConfig({ logger, sequelize, ioRedisClient, config }) {
        BaseUseCase.logger = logger;
        BaseUseCase.sequelize = sequelize;
        BaseUseCase.ioRedisClient = ioRedisClient;
        BaseUseCase.config = config;
    }

    run(...args) {
        if (!BaseUseCase.sequelizeInstance) return super.run(...args);

        return BaseUseCase.sequelizeInstance.transaction(async () => {
            return await super.run(...args);
        });
    }

    /* Override validate/doValidation to enable LIVR autoTrim */
    validate(data) {
        const validator =
            this.constructor.cachedValidator ||
            new Validator(this.constructor.validationRules, true).prepare();

        this.constructor.cachedValidator = validator;

        return this._doValidationWithValidator(data, validator);
    }

    doValidation(data, rules) {
        const validator = new Validator(rules, true).prepare();

        return this._doValidationWithValidator(data, validator);
    }

    get logger() {
        return BaseUseCase.logger;
    }

    get sequelize() {
        return BaseUseCase.sequelize;
    }

    get ioRedisClient() {
        return BaseUseCase.ioRedisClient;
    }

    get config() {
        return BaseUseCase.config;
    }
}

export default BaseUseCase;
