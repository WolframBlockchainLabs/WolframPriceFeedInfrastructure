import MarketsRefresher from './MarketsRefresher.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import collectorsConfig from '../../collectorsConfig.cjs';

const provider = new AppWorkerProvider(MarketsRefresher);

provider.runInInterval(
    provider.config.intervals.marketsRefresher,
    collectorsConfig.exchanges,
);
