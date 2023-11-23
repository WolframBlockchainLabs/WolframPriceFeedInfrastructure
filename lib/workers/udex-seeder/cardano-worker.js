import UDEXSeeder from './UDEXSeeder.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import cardanoCollectorsConfig from '../../configs/udexCollectorsConfig.cjs';

const provider = new AppWorkerProvider(UDEXSeeder);

provider.runWorker(cardanoCollectorsConfig);
