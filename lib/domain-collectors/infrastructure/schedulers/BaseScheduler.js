import {
    MILLISECONDS_IN_AN_HOUR,
    MILLISECONDS_IN_A_MINUTE,
} from '../../../constants/timeframes.js';
import { Mutex } from 'async-mutex';
import sleep from '../../../utils/sleep.js';

class BaseScheduler {
    static DEFAULT_TASK_NAME = 'anonymous';
    static DEFAULT_RATE_LIMIT_MULTIPLIER = 1;

    constructor({
        logger,
        baseRateLimit,
        rateLimitMargin,
        rateLimitMultiplier = BaseScheduler.DEFAULT_RATE_LIMIT_MULTIPLIER,
        queuePosition,
        queueSize,
        replicaSize,
        instancePosition,
        taskName = BaseScheduler.DEFAULT_TASK_NAME,
    }) {
        this.logger = logger;
        this.baseRateLimit = baseRateLimit;
        this.rateLimitMargin = rateLimitMargin;
        this.rateLimitMultiplier = rateLimitMultiplier;
        this.queuePosition = queuePosition;
        this.queueSize = queueSize;
        this.replicaSize = replicaSize;
        this.instancePosition = instancePosition;
        this.taskName = taskName;

        this.batchTimeoutDescriptor = null;
        this.operationTimeoutDescriptors = [];
        this.intraIntervalDistance = 0;

        this.startMutex = new Mutex();
        this.stopMutex = new Mutex();
        this.reloadMutex = new Mutex();
        this.updateRTMMutex = new Mutex();

        this.startAssertionMutex = new Mutex();
        this.startAssertionMutex.acquire();
        this.stopAssertionMutex = new Mutex();
        this.startStopMutex = new Mutex();
    }

    get rateLimit() {
        return (
            (this.baseRateLimit +
                this.rateLimitMargin +
                this.intraIntervalDistance) *
            this.rateLimitMultiplier
        );
    }

    async start({ operations, rateLimitMultiplier }) {
        await this.stopAssertionMutex.acquire();
        const startStopMutexRelease = await this.startStopMutex.acquire();
        const startMutexRelease = await this.startMutex.acquire();

        try {
            this.setOperations(operations);
            this.setMultiplier(rateLimitMultiplier);

            await this.initializeScheduler();

            this.logger.info({
                message: `${this.constructor.name} has been initiated for: ${this.taskName}`,
                context: this.getLogContext(),
            });
        } catch (error) {
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
            await this.destroyScheduler();

            this.logger.info({
                message: `${this.constructor.name} has been stopped for: ${this.taskName}`,
                context: this.getLogContext(),
            });
        } catch (error) {
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

            if (newRateLimitMultiplier) {
                await sleep(
                    MILLISECONDS_IN_A_MINUTE * 30 * newRateLimitMultiplier,
                );
            }

            await this.start({
                operations: this.operations,
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

    async runOperations() {
        this.operationTimeoutDescriptors = [];

        const scheduledOperationPromises = this.operations.map(
            (operation, index) => {
                return new Promise((resolve) => {
                    const timeoutDescriptor = setTimeout(async () => {
                        await operation();

                        resolve();
                    }, this.getOperationDelay(index));

                    this.operationTimeoutDescriptors.push(timeoutDescriptor);
                });
            },
        );

        return Promise.all(scheduledOperationPromises);
    }

    async initializeScheduler() {
        await this.runOperations();
    }

    async destroyScheduler() {
        [
            this.batchTimeoutDescriptor,
            ...this.operationTimeoutDescriptors,
        ].forEach((timeoutDescriptor) => {
            clearTimeout(timeoutDescriptor);
        });

        this.batchTimeoutDescriptor = null;
        this.operationTimeoutDescriptors = [];
    }

    getOperationsBatchDelay() {
        return (
            this.rateLimit *
            this.queuePosition *
            this.operationsAmount *
            this.replicaSize
        );
    }

    getOperationDelay(operationPosition) {
        return (
            this.rateLimit * operationPosition +
            this.rateLimit * this.instancePosition * this.operationsAmount
        );
    }

    setOperations(operations) {
        if (!Array.isArray(operations) || !operations.length) {
            throw new Error(
                `${this.constructor.name}'s operations are not provided!`,
            );
        }

        this.operations = operations;
        this.operationsAmount = this.operations.length;
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
        throw new Error(
            `${this.constructor.name}'s getIntervalBounds method is not implemented`,
        );
    }
}

export default BaseScheduler;
