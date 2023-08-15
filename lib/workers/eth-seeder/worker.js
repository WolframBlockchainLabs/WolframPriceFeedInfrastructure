import ETHSeeder from './ETHSeeder.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import ethCollectorsConfig from '../../configs/ethCollectorsConfig.cjs';

const provider = new AppWorkerProvider(ETHSeeder);

provider.runWorker(ethCollectorsConfig);
