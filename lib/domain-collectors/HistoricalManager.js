import CollectorsManager from './CollectorsManager.js';
import HistoricalScheduler from './infrastructure/schedulers/HistoricalScheduler.js';

class HistoricalManager extends CollectorsManager {
    async start() {
        await this.loadMarketContext();
        await this.connectCollectors();

        await this.startScheduler();
    }

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
