import CollectorsManager from './CollectorsManager.js';
import HistoricalScheduler from './infrastructure/HistoricalScheduler.js';

class HistoricalManager extends CollectorsManager {
    async start() {
        await this.loadMarketContext();
        await this.initCollectors();

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
