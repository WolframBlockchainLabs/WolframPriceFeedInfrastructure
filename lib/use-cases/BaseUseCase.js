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
        if (!BaseUseCase.sequelizeInstance)
            /* c8 ignore next */ return super.run(...args);

        const run = super.run.bind(this);
        const transaction = global.testTransaction /* c8 ignore next */ || null;

        return BaseUseCase.sequelizeInstance.transaction(
            { transaction },
            async () => {
                let result = null;

                try {
                    result = await run(...args);
                } catch (e) {
                    if (e instanceof Exception || !e.code) {
                        throw e;
                    }

                    throwError(e.code);
                }

                return result;
            },
        );
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
