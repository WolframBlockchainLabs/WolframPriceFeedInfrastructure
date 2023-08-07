const confme = require('confme');

const ccxtCollectorsConfig = confme(
    `${__dirname}/../../configs/ccxt/ccxt-collectors.config.json`,
    `${__dirname}/../../configs/ccxt/ccxt-collectors.config-schema.json`,
);

module.exports = ccxtCollectorsConfig;
