const confme = require('confme');

const ccxtHistoricalCollectorsConfig = confme(
    `${__dirname}/../../configs/ccxt/ccxt-collectors-historical.config.json`,
    `${__dirname}/../../configs/ccxt/ccxt-collectors.config-schema.json`,
);

module.exports = ccxtHistoricalCollectorsConfig;
