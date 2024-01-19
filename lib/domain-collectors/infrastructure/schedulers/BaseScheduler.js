import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import { Mutex } from 'async-mutex';
import sleep from '#utils/sleep.js';

class BaseScheduler {
    static DEFAULT_TASK_NAME = 'anonymous';
    static DEFAULT_RATE_LIMIT_MULTIPLIER = 1;
    static DEFAULT_BASE_RELOAD_SLEEP = MILLISECONDS_IN_A_MINUTE * 30;

    static SINGLE_REPLICA_CONFIG = {
        replicaSize: 1,
        instancePosition: 0,
    };

    constructor({
        logger,
        baseRateLimit,
        rateLimitMargin,
        rateLimitMultiplier = BaseScheduler.DEFAULT_RATE_LIMIT_MULTIPLIER,
        queuePosition,
        queueSize,
        replicaSize = BaseScheduler.SINGLE_REPLICA_CONFIG.replicaSize,
        instancePosition = BaseScheduler.SINGLE_REPLICA_CONFIG.instancePosition,
        taskName = BaseScheduler.DEFAULT_TASK_NAME,
        baseReloadSleep = BaseScheduler.DEFAULT_BASE_RELOAD_SLEEP,
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
        this.baseReloadSleep = baseReloadSleep;

        this.operations = [];
        this.batchTimeoutDescriptor = null;
        this.operationTimeoutDescriptors = [];
        this.intraIntervalDistance = 0;

        this.startMutex = new Mutex();
        this.stopMutex = new Mutex();
        this.reloadMutex = new Mutex();

        this.startAssertionMutex = new Mutex();
        this.startAssertionMutex.acquire();
        this.stopAssertionMutex = new Mutex();
        this.startStopMutex = new Mutex();
    }

    get rateLimit() {
        return (
            (this.baseRateLimit + this.rateLimitMargin) *
                this.rateLimitMultiplier +
            this.intraIntervalDistance
        );
    }

    async start(dynamicConfig) {
        await this.stopAssertionMutex.acquire();
        const startStopMutexRelease = await this.startStopMutex.acquire();
        const startMutexRelease = await this.startMutex.acquire();

        try {
            this.setDynamicConfig(dynamicConfig);

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

    async reload({ shouldSleep, rateLimitMultiplier, ...dynamicConfig }) {
        const reloadMutexRelease = await this.reloadMutex.acquire();

        try {
            await this.stop();

            if (shouldSleep) {
                await sleep(this.baseReloadSleep * rateLimitMultiplier);
            }

            await this.start({
                operations: this.operations,
                rateLimitMultiplier,
                ...dynamicConfig,
            });

            this.logger.info({
                message: `${this.constructor.name} has been reloaded for: ${this.taskName}`,
                context: this.getLogContext(),
            });
        } finally {
            reloadMutexRelease();
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
        this.intraIntervalDistance = 0;
    }

    getOperationsBatchDelay() {
        return (
            this.rateLimit *
            this.queuePosition *
            this.operations.length *
            this.replicaSize
        );
    }

    getOperationDelay(operationPosition) {
        return (
            this.rateLimit * operationPosition +
            this.rateLimit * this.instancePosition * this.operations.length
        );
    }

    setDynamicConfig({
        operations,
        rateLimitMultiplier,
        taskName,
        replicaConfig,
    }) {
        if (taskName) this.taskName = taskName;

        if (rateLimitMultiplier) this.rateLimitMultiplier = rateLimitMultiplier;

        if (replicaConfig) {
            this.replicaSize = replicaConfig.replicaSize;
            this.instancePosition = replicaConfig.instancePosition;
        }

        if (operations) this.operations = operations;
    }

    getLogContext() {
        return {
            rateLimit: this.rateLimit,
            instancePosition: this.instancePosition,
            replicaSize: this.replicaSize,
            queueSize: this.queueSize,
            queuePosition: this.queuePosition,
        };
    }

    getMultiplierBackoff() {
        return this.rateLimitMultiplier + 1;
    }

    getMultiplier() {
        return this.rateLimitMultiplier;
    }
}

export default BaseScheduler;
