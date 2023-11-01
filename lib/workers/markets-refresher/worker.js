import MarketsRefresher from './MarketsRefresher.js';
import AppWorkerProvider from '../AppWorkerProvider.js';
import ccxtRealtimeCollectorsConfig from '../../configs/ccxtRealtimeCollectorsConfig.cjs';

const provider = new AppWorkerProvider(MarketsRefresher);

provider.runInInterval(
    provider.config.intervals.marketsRefresher,
    ccxtRealtimeCollectorsConfig.exchanges,
);
