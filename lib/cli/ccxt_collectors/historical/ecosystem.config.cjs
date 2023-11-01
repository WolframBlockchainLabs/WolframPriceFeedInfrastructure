const path = require('path');
const { spawn } = require('child_process');
const ccxtHistoricalCollectorsConfig = require('../../../configs/ccxtHistoricalCollectorsConfig.cjs');
const ccxtAllocator = require('../ccxtAllocator.cjs');

const { exchanges, rateLimit, rateLimitMargin } =
    ccxtHistoricalCollectorsConfig;

const exchangeBins = ccxtAllocator(exchanges);

exchangeBins.forEach((exchangeBin) => {
    const args = [
        `--exchanges='${JSON.stringify(exchangeBin)}'`,
        `--rateLimit=${rateLimit}`,
        `--rateLimitMargin=${rateLimitMargin}`,
        `--scheduleStartDate=${process.argv[2]}`,
        `--scheduleEndDate=${process.argv[3]}`,
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
