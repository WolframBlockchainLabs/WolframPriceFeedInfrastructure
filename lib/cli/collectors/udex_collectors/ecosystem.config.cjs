const path = require('path');
const ProcessAllocator = require('#domain-collectors/infrastructure/ProcessAllocator.cjs');
const udexCollectorsConfig = require('#configs/udexCollectorsConfig.cjs');

const groupName = process.argv[4];
const groupConfig = udexCollectorsConfig[groupName];

if (!groupConfig) {
    throw new Error(`Group configuration for '${groupName}' not found.`);
}

const processAllocator = new ProcessAllocator(groupConfig.processAllocation);
const exchangeBins = processAllocator.allocateExchangeBins(
    groupConfig.exchanges.map((exchange) => exchange.id),
);

const udexCollectorsCluster = exchangeBins.map((exchangeBin, index) => {
    return {
        script: path.resolve(__dirname, 'entrypoint.js'),
        name: `udex-realtime-collector-${index}`,
        exec_mode: 'cluster',
        instances: 1,
        watch: false,
        autorestart: true,
        args: `
            --groupName='${groupName}'
            --exchangeIds='${JSON.stringify(exchangeBin)}'
        `,
    };
});

module.exports = udexCollectorsCluster;
