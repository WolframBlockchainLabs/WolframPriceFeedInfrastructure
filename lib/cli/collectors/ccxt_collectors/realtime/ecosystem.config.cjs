const path = require('path');
const ccxtCollectorsConfig = require('#configs/ccxtCollectorsConfig.cjs');
const ProcessAllocator = require('#domain-collectors/infrastructure/ProcessAllocator.cjs');

const { exchanges, processAllocation } = ccxtCollectorsConfig.realtime;

const processAllocator = new ProcessAllocator(processAllocation);
const exchangeBins = processAllocator.allocateExchangeBins(
    exchanges.map((exchange) => exchange.id),
);

const ccxtCollectorsCluster = exchangeBins.map((exchangeBin, index) => {
    return {
        script: path.resolve(__dirname, 'entrypoint.js'),
        name: `ccxt-realtime-collector-${index}`,
        exec_mode: 'cluster',
        instances: 1,
        watch: false,
        autorestart: true,
        args: `
            --exchangeIds='${JSON.stringify(exchangeBin)}'
        `,
    };
});

module.exports = ccxtCollectorsCluster;
