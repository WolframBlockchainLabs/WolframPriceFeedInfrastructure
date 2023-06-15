import { fileURLToPath }    from 'url';
import { dirname, resolve } from 'path';
import { spawn }            from 'child_process';

import config from '../configCollector.cjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

(async function main() {
    // eslint-disable-next-line guard-for-in
    for (const exchange in config.collectorManager.exchanges) {
        const child = spawn('node', [
            resolve(__dirname, 'collectorRunner.js'),
            `--exchange=${exchange}`
        ]);

        child.stdout.on('data', (data) => {
            console.log(
                `child.stdout --${exchange}--`,
                // eslint-disable-next-line no-magic-numbers
                JSON.stringify(data.toString(), null, 2)
            );
        });

        child.stderr.on('data', (data) => {
            console.log(
                `child.stderr --${exchange}--`,
                // eslint-disable-next-line no-magic-numbers
                JSON.stringify(data.toString(), null, 2)
            );
        });

        child.on('error', (data) => {
            console.log(
                `child.on[error] --${exchange}--`,
                // eslint-disable-next-line no-magic-numbers
                JSON.stringify(data, null, 2)
            );
        });
    }
}());
