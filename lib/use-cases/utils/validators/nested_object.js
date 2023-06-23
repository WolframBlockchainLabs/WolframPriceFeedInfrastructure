import util from 'livr/lib/util.js';
import Validator from 'livr/lib/Validator.js';

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

function nested_object(livr, ruleBuilders) {
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

export default nested_object;
