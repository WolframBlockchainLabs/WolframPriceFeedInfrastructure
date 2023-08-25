import UDEXSeeder from './UDEXSeeder.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import tezosCollectorsConfig from '../../configs/tezosCollectorsConfig.cjs';

const provider = new AppWorkerProvider(UDEXSeeder);

provider.runWorker(tezosCollectorsConfig);
