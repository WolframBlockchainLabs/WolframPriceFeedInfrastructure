const path = require('path');
const cardanoCollectorsConfig = require('../../../configs/cardanoCollectorsConfig.cjs');

const {
    projectId,
    exchanges,
    rateLimit,
    rateLimitMargin,
    replicaSize,
    instancePosition,
} = cardanoCollectorsConfig;

const cardanoCollectorsCluster = {
    script: path.resolve(__dirname, 'entrypoint.js'),
    name: 'cardano-collector',
    exec_mode: 'cluster',
    instances: 1,
    watch: false,
    autorestart: true,
    args: `
        --exchanges='${JSON.stringify(exchanges)}'
        --apiKey=${projectId}
        --baseRateLimit=${rateLimit}
        --rateLimitMargin=${rateLimitMargin}
        --instancePosition=${instancePosition}
        --replicaSize=${replicaSize}
    `,
};

module.exports = cardanoCollectorsCluster;
