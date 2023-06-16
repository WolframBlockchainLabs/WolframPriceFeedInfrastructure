/* eslint-disable more/no-hardcoded-configuration-data */
/* eslint-disable import/no-commonjs */
/* eslint-disable camelcase */
const config = require('./lib/collector/configCollector.cjs');

const exchangesArray = Object.values(config.collectorManager.exchanges);

const interval = config.collectorManager.interval;

const ccxtCollectorsCluster = exchangesArray.reduce((acc, exchange) => {
    const exchangeArray = exchange.symbols.map((symbol) => {
        return {
            script      : './lib/collector/collectorRunner.js',
            name        : 'collector',
            exec_mode   : 'cluster',
            instances   : 1,
            watch       : false,
            autorestart : true,
            args        : [ `${exchange.id}`, `${symbol}`, `${interval}` ]
        };
    });

    return [ ...acc, ...exchangeArray ];
}, []);


module.exports = ccxtCollectorsCluster;

// `--exchange=${exchange.id} --symbol=${symbol} --interval=${interval}`
