import { Validator } from 'livr';
import ChistaServiceBase from '../infrastructure/chista/ChistaServiceBase.cjs';
import './utils/registerValidationRules.js';

class BaseUseCase extends ChistaServiceBase {
    static setLogger(logger) {
        BaseUseCase.logger = logger;
    }

    static setSequelizeInstance(sequelize) {
        BaseUseCase.sequelize = sequelize;
    }

    static setAppConfig(config) {
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

    get config() {
        return BaseUseCase.config;
    }
}

export default BaseUseCase;
