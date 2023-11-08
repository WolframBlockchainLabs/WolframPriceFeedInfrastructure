import cron from 'node-cron';
import cronParser from 'cron-parser';
import closestDivisor from '../utils/closestDivisor.js';
import {
    MILLISECONDS_IN_A_MINUTE,
    MINUTES_IN_AN_HOUR,
} from '../constants/timeframes.js';

class CollectorsScheduler {
    static DEFAULT_TASK_NAME = 'anonymous';

    static DEFAULT_RATE_LIMIT_MULTIPLIER = 1;

    get rateLimit() {
        return (
            (this.baseRateLimit + this.rateLimitMargin) *
            this.rateLimitMultiplier
        );
    }

    constructor({
        logger,
        rateLimit,
        rateLimitMargin,
        rateLimitMultiplier,
        operationsAmount,
        queuePosition,
        queueSize,
        replicaSize,
        instancePosition,
        taskName,
    }) {
        this.logger = logger;

        this.rateLimitMargin = rateLimitMargin;
        this.rateLimitMultiplier =
            rateLimitMultiplier ??
            CollectorsScheduler.DEFAULT_RATE_LIMIT_MULTIPLIER;
        this.baseRateLimit = rateLimit;

        this.operationsAmount = operationsAmount;
        this.queuePosition = queuePosition;
        this.queueSize = queueSize;
        this.replicaSize = replicaSize;
        this.instancePosition = instancePosition;
        this.taskName = taskName ?? CollectorsScheduler.DEFAULT_TASK_NAME;

        this.interval = null;
        this.intraIntervalDistance = null;
        this.normalizedInterval = null;
        this.schedule = null;
        this.cronTask = null;
        this.intervalStart = null;
        this.intervalEnd = null;
    }

    async start(rateLimitMultiplier) {
        this.setRateLimitMultiplier(rateLimitMultiplier);

        this.setupInterval();
        this.setupSchedule();

        this.logger.info({
            message: `CollectorsScheduler has been initiated for: ${this.taskName}`,
            interval: this.interval,
            intraIntervalDistance: this.intraIntervalDistance,
            normalizedInterval: this.normalizedInterval,
            rateLimit: this.rateLimit,
        });

        return this.getOneCyclePromise();
    }

    async stop() {
        this.cronTask.stop();

        return this.getOneCyclePromise();
    }

    async reload(rateLimitMultiplier) {
        await this.stop();

        await this.start(rateLimitMultiplier);
    }

    async runCollectors() {
        this.setNextInterval();
    }

    async getOneCyclePromise() {
        return new Promise((res) => {
            setTimeout(() => {
                res();
            }, this.normalizedInterval * MILLISECONDS_IN_A_MINUTE);
        });
    }

    setupInterval() {
        const intervalInMilliseconds =
            this.rateLimit *
            this.queueSize *
            this.operationsAmount *
            this.replicaSize;

        this.setNormalizedInterval(intervalInMilliseconds);

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

    setRateLimitMultiplier(multiplier) {
        if (!multiplier || multiplier <= 0) return;

        this.rateLimitMultiplier = multiplier;
    }

    setNormalizedInterval(intervalInMilliseconds) {
        const intervalInMinutes = Math.ceil(
            intervalInMilliseconds / MILLISECONDS_IN_A_MINUTE,
        );

        if (intervalInMinutes > MINUTES_IN_AN_HOUR) {
            this.logger.warning({
                message: `intervalInMinutes is bigger then an hour for: ${this.taskName}, it will be truncated to 60 minutes`,
                interval: this.interval,
                intraIntervalDistance: this.intraIntervalDistance,
                normalizedInterval: this.normalizedInterval,
                rateLimit: this.rateLimit,
            });

            this.normalizedInterval = MINUTES_IN_AN_HOUR;
        } else {
            this.normalizedInterval = closestDivisor(
                intervalInMinutes,
                MINUTES_IN_AN_HOUR,
            );
        }
    }
}

export default CollectorsScheduler;
