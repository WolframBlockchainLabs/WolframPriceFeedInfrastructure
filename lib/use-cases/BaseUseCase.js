import { Validator } from 'livr';
import ChistaServiceBase from 'chista/ServiceBase.js';
import './registerValidationRules.js';

class BaseUseCase extends ChistaServiceBase.default {
    static setSequelizeInstance(sequelize) {
        BaseUseCase.sequelizeInstance = sequelize;
    }

    static setAppConfig(config) {
        BaseUseCase.appConfig = config;
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
}

export default BaseUseCase;
