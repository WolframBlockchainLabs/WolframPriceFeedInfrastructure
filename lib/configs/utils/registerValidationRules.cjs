const { AsyncValidator } = require('livr/async.js');
const extraRules = require('livr-extra-rules');
const customValidators = require('./validators/index.cjs');

const defaultRules = {
    ...extraRules,
    ...customValidators,
};

AsyncValidator.registerDefaultRules(defaultRules);
