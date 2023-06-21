/* eslint-disable no-magic-numbers */
/* eslint-disable max-len */
import uniq from 'lodash/uniq.js';
import LIVR from 'livr';
import util from 'livr/lib/util.js';
import Validator from 'livr/lib/Validator.js';
import extraRules from 'livr-extra-rules';

/*
 * Fix [Object: null prototype] validation error
 * @see https://stackoverflow.com/questions/56298481/how-to-fix-object-null-prototype-title-product
 */
function isObject(obj) {
    const prototype = Object.getPrototypeOf(obj);

    return (
        Object(obj) === obj && (prototype === Object.prototype || !prototype)
    );
}

const defaultRules = {
    ...extraRules,
    symbol() {
        return (value, params, outputArr) => {
            const normalizeSymbol = value.replace(/_/g, '/');

            outputArr.push(normalizeSymbol);
        };
    },

    array_params() {
        return (value, params, outputArr) => {
            const normalizeParams = value.split(',');

            outputArr.push(normalizeParams);
        };
    },

    date_compare() {
        return (value, params) => {
            const { rangeDateStart, rangeDateEnd } = params;

            if (
                isNaN(new Date(rangeDateStart)) ||
                isNaN(new Date(rangeDateEnd))
            ) {
                return;
            }

            if (rangeDateStart > rangeDateEnd)
                return 'DATE START CANNOT BE LATE THAN DATA END';
        };
    },
    iso_timestamp() {
        return (value) => {
            const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
            const isoTimestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

            if (!value) return;

            if (!isoDateRegex.test(value) && !isoTimestampRegex.test(value))
                return 'INVALID_ISO_DATE_OR_TIMESTAMP';

            if (isNaN(new Date(value))) return `WRONG_DATE ${value}`;

            return;
        };
    },

    not_null() {
        return (value) => {
            if (value === null) return 'CANNOT_BE_NULL';

            return;
        };
    },
    nullable() {
        return (value, params, outputArr) => {
            if (util.isNoValue(value)) return;
            if (!util.isPrimitiveValue(value)) return 'FORMAT_ERROR';

            if ([null, 'null'].indexOf(value) >= 0) {
                outputArr.push(null);
            }
        };
    },
    required_if_present(queryKey) {
        return (value, params) => {
            if (queryKey && params[queryKey] && util.isNoValue(value)) {
                return 'REQUIRED';
            }

            return;
        };
    },
    unique_list() {
        return (list) => {
            if (list === undefined || list === '') return;
            if (!Array.isArray(list)) return 'FORMAT_ERROR';
            if (uniq(list).length !== list.length) return 'ITEMS_NOT_UNIQUE';

            return;
        };
    },
    date_greater_then_field(field) {
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
    date_less_then_field(field) {
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
    nested_object(livr, ruleBuilders) {
        const validator = new Validator(livr)
            .registerRules(ruleBuilders)
            .prepare();

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
    },
};

LIVR.Validator.registerDefaultRules(defaultRules);
