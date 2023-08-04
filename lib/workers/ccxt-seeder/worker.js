import CCXTSeeder from './CCXTSeeder.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import collectorsConfig from '../../collectorsConfig.cjs';

const provider = new AppWorkerProvider(CCXTSeeder);

provider.runWorker(collectorsConfig.exchanges);
