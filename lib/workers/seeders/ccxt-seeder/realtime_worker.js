import CCXTSeeder from './CCXTSeeder.js';
import AppWorkerProvider from '#workers/AppWorkerProvider.js';
import ccxtCollectorsConfig from '#configs/ccxtCollectorsConfig.cjs';

const provider = new AppWorkerProvider(CCXTSeeder);

provider.runWorker(ccxtCollectorsConfig.realtime.exchanges);
