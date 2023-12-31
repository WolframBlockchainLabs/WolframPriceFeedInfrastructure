import MarketsRefresher from './MarketsRefresher.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import ccxtCollectorsConfig from '#configs/ccxtCollectorsConfig.cjs';

const provider = new AppWorkerProvider(MarketsRefresher);

provider.runInInterval(
    provider.config.intervals.marketsRefresher,
    ccxtCollectorsConfig.realtime.exchanges,
);
