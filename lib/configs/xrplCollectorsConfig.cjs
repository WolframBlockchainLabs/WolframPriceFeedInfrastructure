require('./utils/registerValidationRules.cjs');
const confme = require('confme');

const xrplCollectorsConfig = confme(
    `${__dirname}/../../configs/xrpl/xrpl-collectors.config.json`,
    `${__dirname}/../../configs/xrpl/xrpl-collectors.config-schema.json`,
);

module.exports = xrplCollectorsConfig;
