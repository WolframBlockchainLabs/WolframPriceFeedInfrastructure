const path = require('path');
const xrplCollectorsConfig = require('#configs/xrplCollectorsConfig.cjs');

const {
    serverUrl,
    exchange,
    markets,
    rateLimit,
    rateLimitMargin,
    replicaSize,
    instancePosition,
} = xrplCollectorsConfig;

const xrplCollectorsCluster = {
    script: path.resolve(__dirname, 'entrypoint.js'),
    name: 'xrpl-collector',
    exec_mode: 'cluster',
    instances: 1,
    watch: false,
    autorestart: true,
    args: `
        --markets='${JSON.stringify(markets)}'
        --exchange='${JSON.stringify(exchange)}'
        --serverUrl=${serverUrl}
        --baseRateLimit=${rateLimit}
        --rateLimitMargin=${rateLimitMargin}
        --instancePosition=${instancePosition}
        --replicaSize=${replicaSize}
    `,
};

module.exports = xrplCollectorsCluster;
