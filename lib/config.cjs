const confme = require('confme');

const config = confme(
    `${__dirname}/../configs/system/system.config.json`,
    `${__dirname}/../configs/system/system.config-schema.json`,
);

module.exports = config;
