import MarketManagerException from '#domain-model/exceptions/collectors/control-plane/MarketManagerException.js';
import TimeoutMutex from './utils/TimeoutMutex.js';

class MarketsManager {
    static MUTEX_TIMEOUT = 1000 * 60 * 5;

    constructor({
        logger,
        amqpClient,
        rabbitGroupName,
        externalExchangeId,
        identityModifier,
        mutexTimeout = this.constructor.MUTEX_TIMEOUT,
        schedulersFactory,
        collectorsManagersFactory,
        marketEventManager,
        Repositories,
    }) {
        this.identityModifier = identityModifier;
        this.externalExchangeId = externalExchangeId;
        this.rabbitGroupName = rabbitGroupName;
        this.mutexTimeout = mutexTimeout;
        this.amqpClient = amqpClient;
        this.logger = logger;

        this.schedulersFactory = schedulersFactory;
        this.collectorsManagersFactory = collectorsManagersFactory;
        this.Repositories = Repositories;
        this.MarketRepository = Repositories.MarketRepository;

        this.collectorsManagers = [];
        this.collectorsManagersMap = new Map();
        this.marketEventManager = marketEventManager;
        this.internalScheduler = null;

        this.startStopMutex = new TimeoutMutex(this.mutexTimeout);
        this.reloadMutex = new TimeoutMutex(this.mutexTimeout);
    }

    async init() {
        const queueSize = await this.MarketRepository.getQueueSize(
            this.externalExchangeId,
        );

        this.internalScheduler = this.schedulersFactory.create({
            logger: this.logger,
            queueSize,
            operations: this.collectorsManagersFactory.getOptions().models,
        });
    }

    async start(dynamicConfig = {}) {
        const startStopMutexRelease = await this.startStopMutex.acquire();

        try {
            this.internalScheduler.setDynamicConfig(dynamicConfig);

            await this.loadMarkets();

            await Promise.all(
                this.collectorsManagers.map((collectorsManager) =>
                    collectorsManager.start(dynamicConfig),
                ),
            );

            this.logger.info({
                message: `${this.constructor.name} has been started`,
                context: this.getLogContext(),
            });
        } catch (error) {
            throw new MarketManagerException({
                message: `${this.constructor.name} failed to start`,
                context: this.getLogContext(),
                error,
            });
        } finally {
            startStopMutexRelease();
        }
    }

    async stop() {
        const startStopMutexRelease = await this.startStopMutex.acquire();

        try {
            await Promise.all(
                this.collectorsManagers.map((collectorsManager) =>
                    collectorsManager.stop(),
                ),
            );

            this.logger.info({
                message: `${this.constructor.name} has been stopped`,
                context: this.getLogContext(),
            });
        } catch (error) {
            throw new MarketManagerException({
                message: `${this.constructor.name} failed to stop`,
                context: this.getLogContext(),
                error,
            });
        } finally {
            startStopMutexRelease();
        }
    }

    async reload(dynamicConfig = {}) {
        const reloadMutexRelease = await this.reloadMutex.acquire();

        try {
            await this.stop();

            await this.start(dynamicConfig);

            this.logger.info({
                message: `${this.constructor.name} has been reloaded`,
                context: this.getLogContext(),
            });
        } catch (error) {
            throw new MarketManagerException({
                message: `${this.constructor.name} failed to reload`,
                context: this.getLogContext(),
                error,
            });
        } finally {
            reloadMutexRelease();
        }
    }

    async reloadActive(dynamicConfig = {}) {
        const reloadMutexRelease = await this.reloadMutex.acquire();

        try {
            this.internalScheduler.setDynamicConfig(dynamicConfig);
            this.reloadMutex.addTimeout(
                this.internalScheduler.getReloadSleepTime(),
            );

            await Promise.all(
                this.collectorsManagers.map((collectorsManager) => {
                    return collectorsManager.reloadActive(dynamicConfig);
                }),
            );

            this.logger.info({
                message: `${this.constructor.name}'s active markets have been reloaded`,
                context: this.getLogContext(),
            });
        } catch (error) {
            throw new MarketManagerException({
                message: `${this.constructor.name}'s active markets failed to reload`,
                context: this.getLogContext(),
                error,
            });
        } finally {
            reloadMutexRelease();
        }
    }

    async loadMarkets() {
        const queueSize = await this.MarketRepository.getQueueSize(
            this.externalExchangeId,
        );
        const marketIds = await this.MarketRepository.getMarketIds(
            this.externalExchangeId,
        );

        this.internalScheduler.setQueueSize(queueSize);

        this.resolveMarkets(marketIds);
        this.clearDisabledMarkets(marketIds);
    }

    resolveMarkets(marketIds) {
        marketIds.forEach((marketId, queuePosition) => {
            if (!this.collectorsManagersMap.get(marketId)) {
                return this.initMarket({
                    marketId,
                    queuePosition,
                });
            } else {
                return this.updateMarket({
                    marketId,
                    queuePosition,
                });
            }
        });
    }

    clearDisabledMarkets(marketIds) {
        this.collectorsManagers = this.collectorsManagers.filter(
            (collectorsManager) => {
                if (marketIds.includes(collectorsManager.getMarketId())) {
                    return true;
                }

                this.collectorsManagersMap.delete(
                    collectorsManager.getMarketId(),
                );
            },
        );
    }

    initMarket({ marketId, queuePosition }) {
        const collectorsScheduler = this.schedulersFactory.create({
            logger: this.logger,
            queuePosition,
            ...this.internalScheduler.getDynamicConfig(),
        });

        const collectorsManager = this.collectorsManagersFactory.create({
            amqpClient: this.amqpClient,
            logger: this.logger,
            marketId,
            collectorsScheduler,
            marketEventManager: this.marketEventManager,
            Repositories: this.Repositories,
        });

        this.collectorsManagers.push(collectorsManager);

        this.collectorsManagersMap.set(
            collectorsManager.getMarketId(),
            collectorsManager,
        );
    }

    updateMarket({ marketId, queuePosition }) {
        const collectorsManager = this.collectorsManagersMap.get(marketId);

        collectorsManager.setDynamicConfig({
            ...this.internalScheduler.getDynamicConfig(),
            queuePosition,
            queueSize: this.internalScheduler.getQueueSize(),
        });
    }

    getMarketStatuses({ marketIds, status } = {}) {
        const collectorManagers = this.getCollectorManagers(marketIds);

        return collectorManagers.map((collectorsManager) => {
            return {
                marketId: collectorsManager.getMarketId(),
                replicaInstancePosition:
                    this.internalScheduler.getInstancePosition(),
                taskName: collectorsManager.getCollectorManagerTaskName(),
                status: status ?? collectorsManager.getStatus(),
            };
        });
    }

    getCollectorManagers(marketIds) {
        if (!marketIds) return this.collectorsManagers;

        return marketIds.map((marketId) => {
            return this.collectorsManagersMap.get(marketId);
        });
    }

    getIdentity() {
        return `${this.externalExchangeId}::${this.identityModifier}`;
    }

    getInternalScheduler() {
        return this.internalScheduler;
    }

    getReloadTime() {
        return this.internalScheduler.getReloadSleepTime();
    }

    getLogContext(data) {
        return {
            ...this.internalScheduler.getDynamicConfig(),
            preciseInterval: this.internalScheduler.getPreciseInterval(),
            rabbitGroupName: this.rabbitGroupName,
            externalExchangeId: this.externalExchangeId,
            ...data,
        };
    }
}

export default MarketsManager;
