import config from '../config.cjs';

import { CollectorManager } from './CollectorManager.js';


async function main() {
    const collectorManager = new CollectorManager(config);

    collectorManager.start();
}

main().catch((error) => {
    console.error(error);
});
