const confme = require('confme');

const config = confme(
    `${__dirname}/../configs/system.config.json`,
    `${__dirname}/../configs/system.config-schema.json`,
);

module.exports = config;
