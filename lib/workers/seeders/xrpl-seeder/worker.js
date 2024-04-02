import XRPLSeeder from './XRPLSeeder.js';
import AppWorkerProvider from '#workers/AppWorkerProvider.js';
import xrplCollectorsConfig from '#configs/xrplCollectorsConfig.cjs';

const provider = new AppWorkerProvider(XRPLSeeder);

provider.runWorker(xrplCollectorsConfig);
