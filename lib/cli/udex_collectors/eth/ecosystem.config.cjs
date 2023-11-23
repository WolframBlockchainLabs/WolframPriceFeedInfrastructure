const path = require('path');
const ethCollectorsConfig = require('../../../configs/udexCollectorsConfig.cjs');

const {
    providerUrl,
    exchanges,
    rateLimit,
    rateLimitMargin,
    replicaSize,
    instancePosition,
} = ethCollectorsConfig;

const ethCollectorsCluster = {
    script: path.resolve(__dirname, 'entrypoint.js'),
    name: 'eth-collector',
    exec_mode: 'cluster',
    instances: 1,
    watch: false,
    autorestart: true,
    args: `
        --exchanges='${JSON.stringify(exchanges)}'
        --apiKey=${providerUrl}
        --baseRateLimit=${rateLimit}
        --rateLimitMargin=${rateLimitMargin}
        --instancePosition=${instancePosition}
        --replicaSize=${replicaSize}
    `,
};

module.exports = ethCollectorsCluster;
