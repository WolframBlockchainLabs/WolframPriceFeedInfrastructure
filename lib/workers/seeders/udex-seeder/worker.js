import UDEXSeeder from './UDEXSeeder.js';
import AppWorkerProvider from '#workers/AppWorkerProvider.js';
import udexCollectorsConfig from '#configs/udexCollectorsConfig.cjs';

const provider = new AppWorkerProvider(UDEXSeeder);

provider.runWorker(udexCollectorsConfig);
