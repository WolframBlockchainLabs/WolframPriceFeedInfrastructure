const path = require('path');
const { spawn } = require('child_process');
const ccxtCollectorsConfig = require('#configs/ccxtCollectorsConfig.cjs');

const { exchanges, rateLimit, rateLimitMargin } =
    ccxtCollectorsConfig.historical;

exchanges.forEach((exchange) => {
    const args = [
        `--exchanges='${JSON.stringify([exchange])}'`,
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
