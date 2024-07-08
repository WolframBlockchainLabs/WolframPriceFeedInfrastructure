import AppWorkerProvider from '#workers/AppWorkerProvider.js';
import ccxtCollectorsConfig from '#configs/ccxtCollectorsConfig.cjs';
import CCXTRealtimeSeeder from './CCXTRealtimeSeeder.js';

const provider = new AppWorkerProvider(CCXTRealtimeSeeder);

provider.runWorker(ccxtCollectorsConfig.realtime.exchanges);
