const confme = require('confme');

const collectorsConfig = confme(
    `${__dirname}/../configs/collectors.config.json`,
);

module.exports = collectorsConfig;
