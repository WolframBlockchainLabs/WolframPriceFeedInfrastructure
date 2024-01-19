import { Mutex } from 'async-mutex';
import AMQPManagementTarget from './infrastructure/AMQPManagementTarget.js';
import BackoffPolicy from './infrastructure/amqp-policies/BackoffPolicy.js';

class MarketsManager {
    static DEFAULT_QUEUE_OFFSET = 0;

    constructor({
        markets,
        logger,
        amqpClient,
        rabbitGroupName,
        schedulersFactory,
        collectorsManagersFactory,
        AMQPPolicies = [],
        policiesConfigs = {},
        queueSize,
        queueOffset = MarketsManager.DEFAULT_QUEUE_OFFSET,
    }) {
        this.rabbitGroupName = rabbitGroupName;
        this.markets = markets;
        this.amqpClient = amqpClient;
        this.logger = logger;
        this.policiesConfigs = policiesConfigs;

        this.schedulersFactory = schedulersFactory;
        this.collectorsManagersFactory = collectorsManagersFactory;
        this.collectorsManagers = [];
        this.collectorsManagersMap = new Map();
        this.AMQPPolicies = AMQPPolicies;
        this.amqpPolicies = [];

        this.queueSize = queueSize ?? this.markets.length;
        this.queueOffset = queueOffset;
        this.reloadMutex = new Mutex();

        this.initMarkets();
        this.initAMQPPolicies();
    }

    async start() {
        for (let amqpPolicy of this.amqpPolicies) {
            await amqpPolicy.start();
        }
    }

    async startMarkets(dynamicConfig) {
        const marketsStartPromises = this.collectorsManagers.map(
            (collectorsManager) => collectorsManager.start(dynamicConfig),
        );

        return Promise.all(marketsStartPromises);
    }

    async reloadMarkets(dynamicConfig) {
        const reloadMutexRelease = await this.reloadMutex.acquire();

        try {
            await Promise.all(
                this.collectorsManagers.map((collectorsManager) => {
                    return collectorsManager.reloadScheduler(dynamicConfig);
                }),
            );

            this.logger.info({
                message: `${this.constructor.name} has been reloaded`,
                context: this.getLogContext(),
            });
        } catch (error) {
            this.logger.error({
                message: `${this.constructor.name} failed to reload`,
                context: this.getLogContext(),
                error,
            });
        } finally {
            reloadMutexRelease();
        }
    }

    async broadcastRateLimitChange(rateLimitMultiplier) {
        const backoffPolicy = this.amqpPolicies.find(
            (amqpPolicy) => amqpPolicy instanceof BackoffPolicy,
        );

        if (!backoffPolicy) return;

        return backoffPolicy.broadcastRateLimitChange(rateLimitMultiplier);
    }

    initMarkets() {
        this.markets.forEach((market, queuePosition) => {
            const collectorsScheduler = this.schedulersFactory.create({
                queuePosition: queuePosition + this.queueOffset,
                queueSize: this.queueSize,
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

    initAMQPPolicies() {
        const amqpManagementTarget = new AMQPManagementTarget({
            startHandler: this.startMarkets.bind(this),
            getStatusHandler: this.getRateLimitMultiplier.bind(this),
            reloadHandler: this.reloadMarkets.bind(this),
            identity: this.queueOffset,
        });

        this.amqpPolicies = this.AMQPPolicies.map((AMQPPolicy) => {
            return new AMQPPolicy({
                amqpClient: this.amqpClient,
                rabbitGroupName: this.rabbitGroupName,
                amqpManagementTarget,
                ...this.policiesConfigs,
            });
        });
    }

    getRateLimitMultiplier() {
        return {
            rateLimitMultiplier: Math.max(
                ...this.collectorsManagers.map((collectorsManager) =>
                    collectorsManager.getRateLimitMultiplier(),
                ),
            ),
        };
    }

    getLogContext() {
        return {
            rabbitGroupName: this.rabbitGroupName,
            queueSize: this.queueSize,
            queueOffset: this.queueOffset,
        };
    }
}

export default MarketsManager;
