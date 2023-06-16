/* eslint-disable import/no-commonjs */
/* eslint-disable camelcase */
const path = require('path');
const config = require('./lib/collector/configCollector.cjs');

const collectorRunnerPath = path.resolve(__dirname, './lib/collector/collectorRunner.js');

const exchangesArray = Object.values(config.collectorManager.exchanges);
const interval = config.collectorManager.interval;

const ccxtCollectorsCluster = exchangesArray.reduce((acc, exchange) => {
    const exchangeArray = exchange.symbols.map((symbol) => {
        return {
            script           : `${collectorRunnerPath} --exchange=${exchange.id} --symbol=${symbol} --interval=${interval}`,
            name             : 'collector',
            exec_mode        : 'cluster',
            exec_interpreter : 'node',
            instances        : 1,
            watch            : false,
            autorestart      : true
        };
    });

    return [ ...acc, ...exchangeArray ];
}, []);


module.exports = ccxtCollectorsCluster;

