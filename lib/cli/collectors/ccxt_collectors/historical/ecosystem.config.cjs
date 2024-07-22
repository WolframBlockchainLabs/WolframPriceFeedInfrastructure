const path = require('path');
const { spawn } = require('child_process');
const ccxtCollectorsConfig = require('#configs/ccxtCollectorsConfig.cjs');
const ProcessAllocator = require('#domain-collectors/utils/ProcessAllocator.cjs');

const { exchanges, processAllocation } = ccxtCollectorsConfig.historical;

const processAllocator = new ProcessAllocator(processAllocation);
const exchangeBins = processAllocator.allocateExchangeBins(
    exchanges.map((exchange) => exchange.id),
);

exchangeBins.forEach((exchangeBin) => {
    const args = [
        `--exchangeIds='${JSON.stringify(exchangeBin)}'`,
        `--scheduleStartDate='${process.argv[2]}'`,
        `--scheduleEndDate='${process.argv[3]}'`,
    ];

    const childProcess = spawn(
        process.execPath,
        [path.resolve(__dirname, 'entrypoint.js'), ...args],
        { stdio: 'inherit' },
    );

    childProcess.on('exit', (code, signal) => {
        console.log(
            `Child process exited with code ${code} and signal ${signal}`,
        );
    });
});
