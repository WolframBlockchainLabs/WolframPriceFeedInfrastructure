/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
import uniq         from 'lodash/uniq.js';
import LIVR         from 'livr';
import util         from 'livr/lib/util.js';
import Validator    from 'livr/lib/Validator.js';
import extraRules   from 'livr-extra-rules';

/*
* Fix [Object: null prototype] validation error
* @see https://stackoverflow.com/questions/56298481/how-to-fix-object-null-prototype-title-product
*/
function isObject(obj) {
    const prototype = Object.getPrototypeOf(obj);

    return Object(obj) === obj && (prototype === Object.prototype || !prototype);
}

const defaultRules = {
    ...extraRules,
    'phone'() {
        return (value, params, outputArr) => {
            if (value) {
                const digits = value.replace(/^\+/, '');

                if (!digits.match(/^(380)\d*$/)) return 'WRONG_PHONE_FORMAT';
                if (digits.length !== 12) return 'WRONG_PHONE_LENGTH';

                outputArr.push(digits);
            }
        };
    },
    'not_null'() {
        return (value) => {
            if (value === null) return 'CANNOT_BE_NULL';

            return;
        };
    },
    'nullable'() {
        return (value, params, outputArr) => {
            if (util.isNoValue(value)) return;
            if (!util.isPrimitiveValue(value)) return 'FORMAT_ERROR';

            // eslint-disable-next-line more/prefer-includes
            if ([ null, 'null' ].indexOf(value) >= 0) {
                outputArr.push(null);
            }
        };
    },
    'password'() {
        return (value) => {
            if (value) {
                if (value.match(/[^A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+/)) {
                    return 'PASSWORD_CONTAINS_UNSUPPORTED_SYMBOLS';
                }

                if (!value.match(/^(?=.*[a-z])(?=.*[A-Z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{6,}$/)) {
                    return 'PASSWORD_NOT_STRONG_ENOUGH';
                }

                return;
            }
        };
    },
    'json'() {
        return (value, params, outputArr) => {
            if (!value) return;

            let data = null;

            try {
                data = JSON.parse(value);
            } catch (e) {
                return;
            }

            outputArr.push(data);
        };
    },
    'required_if_present'(queryKey) {
        return (value, params) => {
            if (queryKey && params[queryKey] && util.isNoValue(value)) {
                return 'REQUIRED';
            }

            return;
        };
    },
    'unique_list'() {
        return list => {
            if (list === undefined || list === '') return;
            if (!Array.isArray(list)) return 'FORMAT_ERROR';
            if (uniq(list).length !== list.length) return 'ITEMS_NOT_UNIQUE';

            return;
        };
    },
    'date_greater_then_field'(field) {
        return (value, params) => {
            if (util.isNoValue(value)) return;
            if (!util.isPrimitiveValue(value)) return 'FORMAT_ERROR';

            const epochField = Date.parse(params[field]);
            const epoch = Date.parse(value);

            if (!epochField && epochField !== 0) return;
            if (!epoch && epoch !== 0) return 'WRONG_DATE';

            const thisDate = new Date(epoch);
            const comparedDate = new Date(epochField);

            if (thisDate <= comparedDate) return 'DATE_TOO_LOW';

            return;
        };
    },
    'date_less_then_field'(field) {
        return (value, params) => {
            if (util.isNoValue(value)) return;
            if (!util.isPrimitiveValue(value)) return 'FORMAT_ERROR';

            const epochField = Date.parse(params[field]);
            const epoch = Date.parse(value);

            if (!epochField && epochField !== 0) return;
            if (!epoch && epoch !== 0) return 'WRONG_DATE';

            const thisDate = new Date(epoch);
            const comparedDate = new Date(epochField);

            if (thisDate >= comparedDate) return 'DATE_TOO_HIGH';

            return;
        };
    },
    /*
    * Fix [Object: null prototype] validation error
    * @see https://stackoverflow.com/questions/56298481/how-to-fix-object-null-prototype-title-product
    */
    'nested_object'(livr, ruleBuilders) {
        const validator = new Validator(livr).registerRules(ruleBuilders).prepare();

        return (nestedObject, params, outputArr) => {
            if (util.isNoValue(nestedObject)) return;
            if (!isObject(nestedObject)) return 'FORMAT_ERROR';

            if (!util.isObject(nestedObject) && isObject(nestedObject)) {
                Object.setPrototypeOf(nestedObject, Object.prototype);
            }

            const result = validator.validate(nestedObject);

            if (result) {
                outputArr.push(result);

                return;
            }

            return validator.getErrors();
        };
    }
};

LIVR.Validator.registerDefaultRules(defaultRules);
