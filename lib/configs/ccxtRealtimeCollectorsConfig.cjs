const confme = require('confme');

const ccxtRealtimeCollectorsConfig = confme(
    `${__dirname}/../../configs/ccxt/ccxt-collectors-realtime.config.json`,
    `${__dirname}/../../configs/ccxt/ccxt-collectors.config-schema.json`,
);

module.exports = ccxtRealtimeCollectorsConfig;
