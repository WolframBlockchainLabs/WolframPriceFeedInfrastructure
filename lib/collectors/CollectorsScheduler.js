import cron from 'node-cron';
import cronParser from 'cron-parser';
import closestDivisor from '../utils/closestDivisor.js';
import { MILLISECONDS_IN_A_MINUTE } from '../constants/timeframes.js';

class CollectorsScheduler {
    static DEFAULT_TASK_NAME = 'anonymous';

    constructor({
        logger,
        rateLimit,
        rateLimitMargin,
        operationsAmount,
        queuePosition,
        queueSize,
        replicaSize,
        instancePosition,
    }) {
        this.logger = logger;

        this.rateLimit = rateLimit + rateLimitMargin;
        this.rateLimitMargin = rateLimitMargin;

        this.operationsAmount = operationsAmount;
        this.queuePosition = queuePosition;
        this.queueSize = queueSize;
        this.replicaSize = replicaSize;
        this.instancePosition = instancePosition;

        this.interval = null;
        this.intraIntervalDistance = null;
        this.normalizedInterval = null;
        this.schedule = null;
        this.cronTask = null;
        this.intervalStart = null;
        this.intervalEnd = null;
    }

    start(taskName = CollectorsScheduler.DEFAULT_TASK_NAME) {
        this.setupInterval();
        this.setupSchedule();

        this.logger.info({
            message: `CollectorsScheduler has been initiated for: ${taskName}`,
            interval: this.interval,
            intraIntervalDistance: this.intraIntervalDistance,
            normalizedInterval: this.normalizedInterval,
        });
    }

    async runCollectors() {
        this.setNextInterval();
    }

    setupInterval() {
        const intervalInMilliseconds =
            this.rateLimit *
            this.queueSize *
            this.operationsAmount *
            this.replicaSize;

        const intervalInMinutes = Math.ceil(
            intervalInMilliseconds / MILLISECONDS_IN_A_MINUTE,
        );

        this.normalizedInterval = closestDivisor(intervalInMinutes, 60);

        this.interval = `*/${this.normalizedInterval} * * * *`;
        this.intraIntervalDistance =
            (this.normalizedInterval * MILLISECONDS_IN_A_MINUTE -
                intervalInMilliseconds) /
            (this.queueSize * this.operationsAmount * this.replicaSize);
    }

    setupSchedule() {
        this.schedule = cronParser.parseExpression(this.interval, {
            preset: 'default',
        });
        this.schedule.next();
        this.schedule.next();

        this.cronTask = cron.schedule(this.interval, () => {
            const desyncTimeout =
                (this.rateLimit + this.intraIntervalDistance) *
                this.queuePosition *
                this.operationsAmount *
                this.replicaSize;

            setTimeout(this.runCollectors.bind(this), desyncTimeout);
        });
    }

    setNextInterval() {
        this.intervalStart = this.schedule.prev().toDate().getTime();
        this.intervalEnd = this.schedule.next().toDate().getTime();

        this.schedule.next();
    }

    getOperationDesync(operationPosition) {
        const desyncTimeout =
            (this.rateLimit + this.intraIntervalDistance) * operationPosition +
            (this.rateLimit + this.intraIntervalDistance) *
                this.instancePosition *
                this.operationsAmount;

        return desyncTimeout;
    }
}

export default CollectorsScheduler;
