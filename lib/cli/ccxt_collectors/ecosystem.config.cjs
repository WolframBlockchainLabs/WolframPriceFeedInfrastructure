const path = require('path');
const ccxtCollectorsConfig = require('../../configs/ccxtCollectorsConfig.cjs');
const distributeExchanges = require('../utils/allocator.cjs');

const { exchanges, rateLimit, rateLimitMargin, replicaSize, instancePosition } =
    ccxtCollectorsConfig;

const exchangeBins = distributeExchanges(exchanges);

const ccxtCollectorsCluster = exchangeBins.map((exchangeBin, index) => {
    return {
        script: path.resolve(__dirname, 'entrypoint.js'),
        name: `ccxt-collector-${index}`,
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
