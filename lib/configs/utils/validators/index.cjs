const greaterThanField = require('./greaterThanField.cjs');
const greaterThanFieldsSum = require('./greaterThanFieldsSum.cjs');
const stringified_list = require('./stringified_list.cjs');

const customValidators = {
    stringified_list,
    greaterThanField,
    greaterThanFieldsSum,
};

module.exports = customValidators;
