const greaterThanField = require('./greaterThanField.cjs');
const stringified_list = require('./stringified_list.cjs');

const customValidators = {
    stringified_list,
    greaterThanField,
};

module.exports = customValidators;
