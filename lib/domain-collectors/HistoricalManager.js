import CollectorsManager from './CollectorsManager.js';
import BackoffPolicy from './infrastructure/amqp-policies/BackoffPolicy.js';
import StatusUpdatePolicy from './infrastructure/amqp-policies/StatusUpdatePolicy.js';
import HistoricalScheduler from './infrastructure/schedulers/HistoricalScheduler.js';

class HistoricalManager extends CollectorsManager {
    initScheduler(schedulerOptions) {
        this.collectorsScheduler = new HistoricalScheduler({
            ...schedulerOptions,
            logger: this.logger,
            taskName: `${this.exchange}::${this.symbol}`,
        });
    }

    initBackoffPolicy(rabbitGroupName) {
        this.backoffPolicy = new BackoffPolicy({
            amqpClient: this.amqpClient,
            rabbitGroupName: `historical::${rabbitGroupName}`,
        });
    }

    initStatusUpdatePolicy(rabbitGroupName) {
        this.statusUpdatePolicy = new StatusUpdatePolicy({
            amqpClient: this.amqpClient,
            rabbitGroupName: `historical::${rabbitGroupName}`,
        });
    }
}

export default HistoricalManager;
