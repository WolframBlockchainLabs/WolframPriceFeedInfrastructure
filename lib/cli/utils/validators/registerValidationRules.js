import { AsyncValidator } from 'livr/async.js';
import extraRules from 'livr-extra-rules';
import customValidators from './index.js';

const defaultRules = {
    ...extraRules,
    ...customValidators,
};

AsyncValidator.registerDefaultRules(defaultRules);
