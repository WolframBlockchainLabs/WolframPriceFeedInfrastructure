import TezosSeeder from './TezosSeeder.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import tezosCollectorsConfig from '../../configs/tezosCollectorsConfig.cjs';

const provider = new AppWorkerProvider(TezosSeeder);

provider.runWorker(tezosCollectorsConfig);
