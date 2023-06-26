import LIVR from 'livr';
import extraRules from 'livr-extra-rules';
import customValidators from './validators/index.js';

const defaultRules = {
    ...extraRules,
    ...customValidators,
};

LIVR.Validator.registerDefaultRules(defaultRules);
