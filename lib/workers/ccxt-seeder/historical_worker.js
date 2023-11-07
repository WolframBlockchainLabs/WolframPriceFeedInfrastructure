import CCXTSeeder from './CCXTSeeder.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import ccxtHistoricalCollectorsConfig from '../../configs/ccxtHistoricalCollectorsConfig.cjs';

const provider = new AppWorkerProvider(CCXTSeeder);

provider.runWorker(ccxtHistoricalCollectorsConfig.exchanges);
