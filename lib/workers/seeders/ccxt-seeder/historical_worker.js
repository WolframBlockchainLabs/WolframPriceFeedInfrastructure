import CCXTSeeder from './CCXTSeeder.js';
import ccxtCollectorsConfig from '#configs/ccxtCollectorsConfig.cjs';
import AppWorkerProvider from '#workers/AppWorkerProvider.js';

const provider = new AppWorkerProvider(CCXTSeeder);

provider.runWorker(ccxtCollectorsConfig.historical.exchanges);
