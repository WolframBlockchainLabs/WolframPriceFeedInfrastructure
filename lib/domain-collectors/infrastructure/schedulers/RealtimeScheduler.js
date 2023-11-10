import cron from 'node-cron';
import cronParser from 'cron-parser';
import closestDivisor from '../../../utils/closestDivisor.js';
import {
    MILLISECONDS_IN_AN_HOUR,
    MILLISECONDS_IN_A_MINUTE,
    MINUTES_IN_AN_HOUR,
} from '../../../constants/timeframes.js';
import { Mutex } from 'async-mutex';

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
        } finally {
            startMutexRelease();
        }
    }

    async stop() {
        const stopMutexRelease = await this.stopMutex.acquire();

        try {
            this.cronTask.stop();

            await this.waitOneCycle();

            this.logger.info({
                message: `${this.constructor.name} has been stopped for: ${this.taskName}`,
                context: this.getLogContext(),
            });
        } finally {
            stopMutexRelease();
        }
    }

    async reload(newRateLimitMultiplier) {
        const reloadMutexRelease = await this.reloadMutex.acquire();

        try {
            await this.stop();
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
        this.updateIntervalBounds();
        this.handler();
    }

    async waitOneCycle() {
        return new Promise((resolve) =>
            setTimeout(
                resolve,
                this.normalizedInterval * MILLISECONDS_IN_A_MINUTE,
            ),
        );
    }

    initializeSchedulerProperties() {
        this.intervalStart = null;
        this.intervalEnd = null;
        this.schedule = null;
        this.cronTask = null;
        this.interval = null;
        this.normalizedInterval = null;
        this.intraIntervalDistance = null;

        this.startMutex = new Mutex();
        this.stopMutex = new Mutex();
        this.reloadMutex = new Mutex();
        this.updateRTMMutex = new Mutex();
    }

    initializeScheduler() {
        this.calculateIntervalProperties();
        this.setupCronTask();
    }

    calculateIntervalProperties() {
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
    }

    setupCronTask() {
        this.schedule = cronParser.parseExpression(this.interval, {
            preset: 'default',
        });
        this.cronTask = cron.schedule(this.interval, () => {
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

    updateIntervalBounds() {
        this.intervalStart = this.schedule.prev().toDate().getTime();
        this.intervalEnd = this.schedule.next().toDate().getTime();
        this.schedule.next();
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
            intervalStart: this.intervalStart,
            intervalEnd: this.intervalEnd,
        };
    }
}

export default RealtimeScheduler;
