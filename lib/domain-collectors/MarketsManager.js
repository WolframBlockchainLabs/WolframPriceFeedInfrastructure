import { Mutex } from 'async-mutex';
import BackoffPolicy from './infrastructure/amqp-policies/BackoffPolicy.js';
import StatusUpdatePolicy from './infrastructure/amqp-policies/StatusUpdatePolicy.js';

class MarketsManager {
    static DEFAULT_QUEUE_OFFSET = 0;

    static INITIAL_RATE_LIMIT_MULTIPLIER = 1;

    constructor({
        markets,
        logger,
        amqpClient,
        rabbitGroupName,
        schedulersFactory,
        collectorsManagersFactory,
        queueSize,
        queueOffset = MarketsManager.DEFAULT_QUEUE_OFFSET,
    }) {
        this.rabbitGroupName = rabbitGroupName;
        this.markets = markets;
        this.amqpClient = amqpClient;
        this.logger = logger;

        this.schedulersFactory = schedulersFactory;
        this.collectorsManagersFactory = collectorsManagersFactory;
        this.collectorsManagers = [];
        this.collectorsManagersMap = new Map();

        this.queueSize = queueSize ?? this.markets.length;
        this.queueOffset = queueOffset;

        this.rateLimitMultiplier = MarketsManager.INITIAL_RATE_LIMIT_MULTIPLIER;
        this.backoffMutex = new Mutex();

        this.initMarkets();
        this.initBackoffPolicy();
        this.initStatusUpdatePolicy();
    }

    async start() {
        await this.startMarkets();

        await this.backoffPolicy.start(({ rateLimitMultiplier }) =>
            this.collectorsReload({ rateLimitMultiplier, shouldSleep: true }),
        );

        await this.statusUpdatePolicy.start({
            updateHandler: this.collectorsReload.bind(this),
            getStatusHandler: this.getRateLimitMultiplier.bind(this),
        });
    }

    async startMarkets() {
        const marketsStartPromises = this.collectorsManagers.map(
            (collectorsManager) => collectorsManager.start(),
        );

        return Promise.all(marketsStartPromises);
    }

    async collectorsReload({ rateLimitMultiplier, shouldSleep }) {
        if (rateLimitMultiplier <= this.rateLimitMultiplier) return;

        const backoffMutexRelease = await this.backoffMutex.acquire();

        try {
            this.rateLimitMultiplier = rateLimitMultiplier;

            await Promise.all(
                this.collectorsManagers.map((collectorsManager) => {
                    return collectorsManager.updateRateLimit({
                        newRateLimitMultiplier: rateLimitMultiplier,
                        shouldSleep,
                    });
                }),
            );

            this.logger.info({
                message: `${this.constructor.name} has been backoff-reloaded for: ${this.rabbitGroupName}`,
            });
        } catch (error) {
            this.logger.info({
                message: `${this.constructor.name} failed to backoff-reload for: ${this.rabbitGroupName}`,
                error,
            });
        } finally {
            backoffMutexRelease();
        }
    }

    async broadcastRateLimitChange(rateLimitMultiplier) {
        await this.collectorsReload({ rateLimitMultiplier });

        await this.backoffPolicy.broadcastRateLimitChange(rateLimitMultiplier);
    }

    initMarkets() {
        this.markets.forEach((market, queuePosition) => {
            const collectorsScheduler = this.schedulersFactory.create({
                queuePosition: queuePosition + this.queueOffset,
                queueSize: this.queueSize,
                rateLimitMultiplier: this.rateLimitMultiplier,
            });
            const collectorsManager = this.collectorsManagersFactory.create({
                ...market,
                collectorsScheduler,
                marketsManager: this,
            });

            this.collectorsManagers.push(collectorsManager);
            this.collectorsManagersMap.set(
                collectorsManager.getCollectorManagerTaskName(),
                collectorsManager,
            );
        });
    }

    initBackoffPolicy() {
        this.backoffPolicy = new BackoffPolicy({
            amqpClient: this.amqpClient,
            rabbitGroupName: this.rabbitGroupName,
        });
    }

    initStatusUpdatePolicy() {
        this.statusUpdatePolicy = new StatusUpdatePolicy({
            amqpClient: this.amqpClient,
            rabbitGroupName: this.rabbitGroupName,
        });
    }

    getRateLimitMultiplier() {
        return { rateLimitMultiplier: this.rateLimitMultiplier };
    }
}

export default MarketsManager;
