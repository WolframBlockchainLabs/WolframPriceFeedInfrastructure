const confme = require('confme');

const collectorsConfig = confme(
    `${__dirname}/../configs/collectors.config.json`,
    `${__dirname}/../configs/collectors.config-schema.json`,
);

module.exports = collectorsConfig;
