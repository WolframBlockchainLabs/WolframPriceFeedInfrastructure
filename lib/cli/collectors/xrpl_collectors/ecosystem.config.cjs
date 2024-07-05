const path = require('path');

const xrplCollectorsCluster = {
    script: path.resolve(__dirname, 'entrypoint.js'),
    name: 'xrpl-collector',
    exec_mode: 'cluster',
    instances: 1,
    watch: false,
    autorestart: true,
};

module.exports = xrplCollectorsCluster;
