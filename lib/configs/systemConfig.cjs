const confme = require('confme');

const systemConfig = confme(
    `${__dirname}/../../configs/system/system.config.json`,
    `${__dirname}/../../configs/system/system.config-schema.json`,
);

module.exports = systemConfig;
