import closestDivisor from '../../../utils/closestDivisor.js';
import {
    MILLISECONDS_IN_AN_HOUR,
    MILLISECONDS_IN_A_MINUTE,
    MINUTES_IN_AN_HOUR,
} from '../../../constants/timeframes.js';
import { Mutex } from 'async-mutex';
import sleep from '../../../utils/sleep.js';
import Cron from 'croner';

class RealtimeScheduler {
    static DEFAULT_TASK_NAME = 'anonymous';
    static DEFAULT_RATE_LIMIT_MULTIPLIER = 1;

    constructor({
        logger,
        baseRateLimit,
        rateLimitMargin,
        rateLimitMultiplier = RealtimeScheduler.DEFAULT_RATE_LIMIT_MULTIPLIER,
        operationsAmount,
        queuePosition,
        queueSize,
        replicaSize,
        instancePosition,
        taskName = RealtimeScheduler.DEFAULT_TASK_NAME,
    }) {
        this.logger = logger;
        this.baseRateLimit = baseRateLimit;
        this.rateLimitMargin = rateLimitMargin;
        this.rateLimitMultiplier = rateLimitMultiplier;
        this.operationsAmount = operationsAmount;
        this.queuePosition = queuePosition;
        this.queueSize = queueSize;
        this.replicaSize = replicaSize;
        this.instancePosition = instancePosition;
        this.taskName = taskName;

        this.initializeSchedulerProperties();
    }

    get rateLimit() {
        return (
            (this.baseRateLimit + this.rateLimitMargin) *
            this.rateLimitMultiplier
        );
    }

    async start({ handler, rateLimitMultiplier }) {
        await this.stopAssertionMutex.acquire();
        const startStopMutexRelease = await this.startStopMutex.acquire();
        const startMutexRelease = await this.startMutex.acquire();

        try {
            this.setHandler(handler);
            this.setMultiplier(rateLimitMultiplier);

            this.initializeScheduler();

            this.logger.info({
                message: `${this.constructor.name} has been initiated for: ${this.taskName}`,
                context: this.getLogContext(),
            });

            await this.waitOneCycle();
        } catch (error) {
            /* istanbul ignore next */
            this.logger.error({
                message: `${this.constructor.name} failed to start for: ${this.taskName}`,
                context: this.getLogContext(),
                error,
            });
        } finally {
            this.startAssertionMutex.release();
            startMutexRelease();
            startStopMutexRelease();
        }
    }

    async stop() {
        await this.startAssertionMutex.acquire();
        const startStopMutexRelease = await this.startStopMutex.acquire();
        const stopMutexRelease = await this.stopMutex.acquire();

        try {
            this.cronTask.stop();

            await this.waitOneCycle();

            this.logger.info({
                message: `${this.constructor.name} has been stopped for: ${this.taskName}`,
                context: this.getLogContext(),
            });
        } catch (error) {
            /* istanbul ignore next */
            this.logger.error({
                message: `${this.constructor.name} failed to stop for: ${this.taskName}`,
                context: this.getLogContext(),
                error,
            });
        } finally {
            this.stopAssertionMutex.release();
            stopMutexRelease();
            startStopMutexRelease();
        }
    }

    async reload(newRateLimitMultiplier) {
        const reloadMutexRelease = await this.reloadMutex.acquire();

        try {
            await this.stop();

            await this.waitBetweenBackoffReload(newRateLimitMultiplier);

            await this.start({
                handler: this.handler,
                rateLimitMultiplier: newRateLimitMultiplier,
            });

            this.logger.info({
                message: `${this.constructor.name} has been reloaded for: ${this.taskName}`,
                context: this.getLogContext(),
            });
        } finally {
            reloadMutexRelease();
        }
    }

    async autoUpdateRateLimitMultiplier() {
        const newMultiplier = this.getMultiplierBackoff();

        return this.updateRateLimitMultiplier(newMultiplier);
    }

    async updateRateLimitMultiplier(newMultiplier) {
        const updateMutexRelease = await this.updateRTMMutex.acquire();

        try {
            if (this.validateMultiplier(newMultiplier)) {
                await this.reload(newMultiplier);
            }
        } finally {
            updateMutexRelease();
        }
    }

    async runCollectors() {
        await this.handler();
    }

    async waitOneCycle() {
        return sleep(this.normalizedInterval * MILLISECONDS_IN_A_MINUTE);
    }

    async waitBetweenBackoffReload(newRateLimitMultiplier) {
        if (newRateLimitMultiplier) {
            await sleep(MILLISECONDS_IN_A_MINUTE * 10 * newRateLimitMultiplier);
        }
    }

    initializeSchedulerProperties() {
        this.cronTask = null;
        this.interval = null;
        this.normalizedInterval = null;
        this.intraIntervalDistance = null;

        this.startMutex = new Mutex();
        this.stopMutex = new Mutex();
        this.reloadMutex = new Mutex();
        this.updateRTMMutex = new Mutex();

        this.startAssertionMutex = new Mutex();
        this.startAssertionMutex.acquire();
        this.stopAssertionMutex = new Mutex();
        this.startStopMutex = new Mutex();
    }

    initializeScheduler() {
        const intervalInMilliseconds =
            this.rateLimit *
            this.queueSize *
            this.operationsAmount *
            this.replicaSize;
        const intervalInMinutes = Math.ceil(
            intervalInMilliseconds / MILLISECONDS_IN_A_MINUTE,
        );

        this.normalizedInterval = closestDivisor(
            intervalInMinutes,
            MINUTES_IN_AN_HOUR,
        );
        this.interval = `*/${this.normalizedInterval} * * * *`;
        this.intraIntervalDistance =
            (this.normalizedInterval * MILLISECONDS_IN_A_MINUTE -
                intervalInMilliseconds) /
            (this.queueSize * this.operationsAmount * this.replicaSize);

        this.cronTask = Cron(this.interval, () => {
            const desyncTimeout = this.calculateDesyncTimeoutForCollector();

            setTimeout(() => this.runCollectors(), desyncTimeout);
        });
    }

    calculateDesyncTimeoutForCollector() {
        return (
            (this.rateLimit + this.intraIntervalDistance) *
            this.queuePosition *
            this.operationsAmount *
            this.replicaSize
        );
    }

    getOperationDesync(operationPosition) {
        return (
            (this.rateLimit + this.intraIntervalDistance) * operationPosition +
            (this.rateLimit + this.intraIntervalDistance) *
                this.instancePosition *
                this.operationsAmount
        );
    }

    setHandler(handler) {
        if (!handler) {
            throw new Error('Handler is not provided!');
        }
        this.handler = handler;
    }

    validateMultiplier(multiplier) {
        if (!multiplier || multiplier <= this.rateLimitMultiplier) {
            return false;
        }

        const projectedIntervalInMilliseconds =
            (this.baseRateLimit + this.rateLimitMargin) *
            multiplier *
            this.queueSize *
            this.operationsAmount *
            this.replicaSize;

        return projectedIntervalInMilliseconds < MILLISECONDS_IN_AN_HOUR;
    }

    setMultiplier(multiplier) {
        const isValidMultiplier = this.validateMultiplier(multiplier);

        if (isValidMultiplier) this.rateLimitMultiplier = multiplier;
    }

    getLogContext() {
        return {
            interval: this.interval,
            intraIntervalDistance: this.intraIntervalDistance,
            normalizedInterval: this.normalizedInterval,
            rateLimit: this.rateLimit,
        };
    }

    getMultiplierBackoff() {
        return this.rateLimitMultiplier + 1;
    }

    getMultiplier() {
        return this.rateLimitMultiplier;
    }

    getIntervalBounds() {
        return {
            intervalStart: new Date(
                this.cronTask.currentRun().setMilliseconds(0),
            ).getTime(),
            intervalEnd: this.cronTask.nextRun().getTime(),
        };
    }
}

export default RealtimeScheduler;
