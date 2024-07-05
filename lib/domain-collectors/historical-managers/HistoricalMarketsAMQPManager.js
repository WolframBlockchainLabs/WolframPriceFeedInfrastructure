import MarketsAMQPManager from '#domain-collectors/MarketsAMQPManager.js';

class HistoricalMarketsAMQPManager extends MarketsAMQPManager {
    getSchedulePromise() {
        return this.marketsManager.getSchedulePromise();
    }
}

export default HistoricalMarketsAMQPManager;
