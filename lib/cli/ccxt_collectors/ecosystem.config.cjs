const path = require('path');
const collectorsConfig = require('../../collectorsConfig.cjs');
const distributeExchanges = require('./allocator.cjs');

const exchangeBins = distributeExchanges(collectorsConfig.exchanges);
const interval = collectorsConfig.interval;

const ccxtCollectorsCluster = exchangeBins.map((exchangeBin) => {
    return {
        script: path.resolve(__dirname, 'entrypoint.js'),
        name: 'collector',
        exec_mode: 'cluster',
        instances: 1,
        watch: false,
        autorestart: true,
        args: `
            --exchanges='${JSON.stringify(exchangeBin)}'
            --interval=${interval}
        `,
    };
});

module.exports = ccxtCollectorsCluster;
