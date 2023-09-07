const path = require('path');
const tezosCollectorsConfig = require('../../configs/tezosCollectorsConfig.cjs');

const {
    providerUrl,
    exchanges,
    rateLimit,
    rateLimitMargin,
    replicaSize,
    instancePosition,
} = tezosCollectorsConfig;

const tezosCollectorsCluster = {
    script: path.resolve(__dirname, 'entrypoint.js'),
    name: 'tezos-collector',
    exec_mode: 'cluster',
    instances: 1,
    watch: false,
    autorestart: true,
    args: `
        --exchanges='${JSON.stringify(exchanges)}'
        --providerUrl='${providerUrl}'
        --rateLimit='${rateLimit}'
        --rateLimitMargin='${rateLimitMargin}'
        --instancePosition='${instancePosition}'
        --replicaSize='${replicaSize}'
    `,
};

module.exports = tezosCollectorsCluster;
