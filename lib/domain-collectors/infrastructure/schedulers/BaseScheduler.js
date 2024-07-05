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
        baseSleepReloadTime = BaseScheduler.DEFAULT_BASE_RELOAD_SLEEP,
        operations = [],
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
        this.baseSleepReloadTime = baseSleepReloadTime;

        this.operations = operations;
        this.operationTimeoutDescriptors = [];
        this.intraIntervalDistance = 0;

        this.startAssertionMutex = new Mutex();
        this.startAssertionMutex.acquire();
        this.stopAssertionMutex = new Mutex();
        this.startStopMutex = new Mutex();
        this.reloadMutex = new Mutex();
    }

    get rateLimit() {
        return (
            (this.baseRateLimit + this.rateLimitMargin) *
            this.rateLimitMultiplier
        );
    }

    async start(dynamicConfig) {
        await this.stopAssertionMutex.acquire();
        const startStopMutexRelease = await this.startStopMutex.acquire();

        try {
            this.setDynamicConfig(dynamicConfig);

            await this.initializeScheduler();

            this.logger.debug({
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
            startStopMutexRelease();
        }
    }

    async stop() {
        await this.startAssertionMutex.acquire();
        const startStopMutexRelease = await this.startStopMutex.acquire();

        try {
            await this.destroyScheduler();

            this.logger.debug({
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
            startStopMutexRelease();
        }
    }

    async reload({ shouldSleep, ...dynamicConfig }) {
        const reloadMutexRelease = await this.reloadMutex.acquire();

        try {
            await this.stop();

            await this.handleReloadSleep(shouldSleep);

            await this.start({
                operations: this.operations,
                ...dynamicConfig,
            });

            this.logger.debug({
                message: `${this.constructor.name} has been reloaded for: ${this.taskName}`,
                context: this.getLogContext(),
            });
        } finally {
            reloadMutexRelease();
        }
    }

    async handleReloadSleep(shouldSleep) {
        if (!shouldSleep) return;

        const sleepTime = this.baseSleepReloadTime * this.rateLimitMultiplier;
        const untilDate = new Date(Date.now() + sleepTime).toISOString();

        this.logger.debug({
            message: `${this.constructor.name} is going to sleep inside reload until: ${untilDate}`,
            context: this.getLogContext(),
        });

        await sleep(sleepTime);
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
        this.operationTimeoutDescriptors.forEach((timeoutDescriptor) => {
            clearTimeout(timeoutDescriptor);
        });

        this.operationTimeoutDescriptors = [];
    }

    getOperationDelay(operationPosition) {
        return (
            this.rateLimit * operationPosition +
            this.rateLimit * this.instancePosition * this.operations.length
        );
    }

    getLogContext() {
        return {
            rateLimit: this.rateLimit,
            rateLimitMultiplier: this.rateLimitMultiplier,
            instancePosition: this.instancePosition,
            replicaSize: this.replicaSize,
            queueSize: this.queueSize,
            queuePosition: this.queuePosition,
        };
    }

    getMultiplierBackoff() {
        return this.rateLimitMultiplier + 1;
    }

    setDynamicConfig(dynamicConfig) {
        Object.assign(this, dynamicConfig);
    }

    getDynamicConfig() {
        return {
            rateLimitMultiplier: this.rateLimitMultiplier,
            replicaSize: this.replicaSize,
            instancePosition: this.instancePosition,
            queueSize: this.queueSize,
        };
    }

    getRateLimitMultiplier() {
        return this.rateLimitMultiplier;
    }

    getInstancePosition() {
        return this.instancePosition;
    }

    getQueueSize() {
        return this.queueSize;
    }

    setQueueSize(queueSize) {
        this.queueSize = queueSize;
    }
}

export default BaseScheduler;
