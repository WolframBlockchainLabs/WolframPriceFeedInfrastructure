import CCXTSeeder from './CCXTSeeder.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import ccxtHistoricalCollectorsConfig from '../../configs/ccxtCollectorsConfig.cjs';

const provider = new AppWorkerProvider(CCXTSeeder);

provider.runWorker(ccxtHistoricalCollectorsConfig.exchanges);
