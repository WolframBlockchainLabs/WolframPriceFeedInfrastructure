const path = require('path');
const ccxtCollectorsConfig = require('#configs/ccxtCollectorsConfig.cjs');
const ccxtAllocator = require('../ccxtAllocator.cjs');

const { exchanges, rateLimit, rateLimitMargin, replicaSize, instancePosition } =
    ccxtCollectorsConfig.realtime;

const exchangeBins = ccxtAllocator(exchanges);

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
            --rateLimit=${rateLimit}
            --rateLimitMargin=${rateLimitMargin}
            --instancePosition=${instancePosition}
            --replicaSize=${replicaSize}
        `,
    };
});

module.exports = ccxtCollectorsCluster;
