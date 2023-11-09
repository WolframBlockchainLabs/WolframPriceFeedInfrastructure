import CollectorsManager from './CollectorsManager.js';
import HistoricalScheduler from './infrastructure/HistoricalScheduler.js';

class HistoricalManager extends CollectorsManager {
    initScheduler(schedulerOptions) {
        this.collectorsScheduler = new HistoricalScheduler({
            ...schedulerOptions,
            logger: this.logger,
            operationsAmount: this.models.length,
            taskName: `${this.exchange}::${this.symbol}`,
        });
    }
}

export default HistoricalManager;
