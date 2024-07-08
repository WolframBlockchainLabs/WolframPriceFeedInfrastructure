import XRPLSeeder from './XRPLSeeder.js';
import xrplCollectorsConfig from '#configs/xrplCollectorsConfig.cjs';
import AppWorkerProvider from '#workers/AppWorkerProvider.js';

const provider = new AppWorkerProvider(XRPLSeeder);

provider.runWorker(xrplCollectorsConfig);
