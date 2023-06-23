import { Validator } from 'livr';
import { throwError } from '../utils/error.js';
import ChistaServiceBase from 'chista/ServiceBase.js';
import Exception from '../domain-model/exceptions/Exception.js';
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
            let result = null;

            try {
                result = await super.run(...args);
            } catch (error) {
                if (error instanceof Exception || !error.code) {
                    throw error;
                }

                throwError(error.code);
            }

            return result;
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
