const path = require('path');
const collectorsConfig = require('../../collectorsConfig.cjs');
const distributeExchanges = require('../utils/allocator.cjs');

const { exchanges, rateLimit, rateLimitMargin, replicaSize, instancePosition } =
    collectorsConfig;

const exchangeBins = distributeExchanges(exchanges);

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
            --rateLimit='${rateLimit}'
            --rateLimitMargin='${rateLimitMargin}'
            --instancePosition='${instancePosition}'
            --replicaSize='${replicaSize}'
        `,
    };
});

module.exports = ccxtCollectorsCluster;
