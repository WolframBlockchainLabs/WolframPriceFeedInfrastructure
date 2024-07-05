import CollectorsManager from '#domain-collectors/CollectorsManager.js';

class HistoricalCollectorsManager extends CollectorsManager {
    getSchedulePromise() {
        return this.collectorsScheduler.getSchedulePromise();
    }
}

export default HistoricalCollectorsManager;
