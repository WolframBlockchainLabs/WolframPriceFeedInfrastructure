import CCXTSeeder from './CCXTSeeder.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import ccxtRealtimeCollectorsConfig from '../../configs/ccxtCollectorsConfig.cjs';

const provider = new AppWorkerProvider(CCXTSeeder);

provider.runWorker(ccxtRealtimeCollectorsConfig.exchanges);
