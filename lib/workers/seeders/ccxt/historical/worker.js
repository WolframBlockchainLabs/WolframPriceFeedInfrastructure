import AppWorkerProvider from '#workers/AppWorkerProvider.js';
import ccxtCollectorsConfig from '#configs/ccxtCollectorsConfig.cjs';
import CCXTHistoricalSeeder from './CCXTHistoricalSeeder.js';

const provider = new AppWorkerProvider(CCXTHistoricalSeeder);

provider.runWorker(ccxtCollectorsConfig.realtime.exchanges);
