const LIVR = require('livr');
const confme = require('confme');
const customValidators = require('./validators/index.cjs');

LIVR.Validator.registerDefaultRules(customValidators);

const systemConfig = confme(
    `${__dirname}/../../configs/system/system.config.json`,
    `${__dirname}/../../configs/system/system.config-schema.json`,
);

module.exports = systemConfig;
