import CCXTSeeder from './CCXTSeeder.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import ccxtRealtimeCollectorsConfig from '../../configs/ccxtRealtimeCollectorsConfig.cjs';

const provider = new AppWorkerProvider(CCXTSeeder);

provider.runWorker(ccxtRealtimeCollectorsConfig.exchanges);
