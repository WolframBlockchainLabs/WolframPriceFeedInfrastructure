/* eslint-disable import/no-commonjs */
/* eslint-disable camelcase */
const path = require('path');
const collectorsConfig = require('../../collectorsConfig.cjs');

const exchangesArray = Object.values(collectorsConfig.exchanges);
const interval = collectorsConfig.interval;

const ccxtCollectorsCluster = exchangesArray.reduce((acc, exchange) => {
    const exchangeArray = exchange.symbols.map((symbol) => {
        return {
            script      : path.resolve(__dirname, 'entrypoint.js'),
            name        : 'collector',
            exec_mode   : 'cluster',
            instances   : 1,
            watch       : false,
            autorestart : true,
            args        : `--exchange=${exchange.id} --symbol=${symbol} --interval=${interval}`
        };
    });

    return [ ...acc, ...exchangeArray ];
}, []);

module.exports = ccxtCollectorsCluster;
