import config from '../config.cjs';

import { CollectorManager } from './CollectorManager.js';

(async function main() {
    if (!process.argv[2].includes('--exchange')) {
        console.log("'exchange' flag is required", process.argv);

        return;
    }

    const exchange = process.argv[2].split('=')[1];

    const collector = new CollectorManager({
        db      : config.db,
        logs    : config.logs,
        symbols : config.collectorManager.exchanges[exchange].symbols,
        exchange
    });

    try {
        await collector.start();
    } catch (error) {
        console.log(error);
    }
}());
