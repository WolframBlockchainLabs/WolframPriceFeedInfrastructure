import MarketsManager from '#domain-collectors/MarketsManager.js';

class HistoricalMarketsManager extends MarketsManager {
    getSchedulePromise() {
        return Promise.all(
            this.collectorsManagers.map((collectorsManager) =>
                collectorsManager.getSchedulePromise(),
            ),
        );
    }
}

export default HistoricalMarketsManager;
