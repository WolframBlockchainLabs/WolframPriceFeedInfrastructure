const path = require('path');

console.log(process.argv[2]);

const udexCollectorsCluster = {
    script: path.resolve(__dirname, 'entrypoint.js'),
    name: 'udex-collector',
    exec_mode: 'cluster',
    instances: 1,
    watch: false,
    autorestart: true,
    args: `--groupName=${process.argv[4]}`,
};

module.exports = udexCollectorsCluster;
