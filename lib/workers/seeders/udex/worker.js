import UDEXSeeder from './UDEXSeeder.js';
import udexCollectorsConfig from '#configs/udexCollectorsConfig.cjs';
import AppWorkerProvider from '#workers/AppWorkerProvider.js';

const provider = new AppWorkerProvider(UDEXSeeder);

provider.runWorker(udexCollectorsConfig);
