import { Validator } from 'livr';
import { throwError } from './../utils/error.js';
import {
    UseCaseBase as ChistaUseCaseBase,
    Exception,
} from './../../packages.js';

import './registerValidationRules.js';

export default class UseCaseBase extends ChistaUseCaseBase {
    static setSequelizeInstance(sequelize) {
        UseCaseBase.sequelizeInstance = sequelize;
    }

    static setAppConfig(config) {
        UseCaseBase.appConfig = config;
    }

    run(...args) {
        if (!UseCaseBase.sequelizeInstance)
            /* c8 ignore next */ return super.run(...args);

        const run = super.run.bind(this);
        const transaction = global.testTransaction /* c8 ignore next */ || null;

        return UseCaseBase.sequelizeInstance.transaction(
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

    sequelizeScope(filters = {}) {
        return Object.keys(filters).map((filterName) => ({
            method: [filterName, filters[filterName]],
        }));
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
