import config from '../../configs/collectorConfig.js';


import { CollectorManager } from './CollectorManager.js';


async function main() {
    const collectorManager = new CollectorManager(config.exchanges);
    collectorManager.start()
}

main().catch((error) => {
  console.error(error);
});
