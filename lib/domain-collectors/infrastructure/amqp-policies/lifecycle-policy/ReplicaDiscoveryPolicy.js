import BroadcastAMQPPolicy from '../BroadcastAMQPPolicy.js';
import TimeoutMutex from '#domain-collectors/utils/TimeoutMutex.js';
import MessageBuffer from '#domain-collectors/utils/MessageBuffer.js';

class ReplicaDiscoveryPolicy extends BroadcastAMQPPolicy {
    static MESSAGE_TYPES = {
        HELLO: 'HELLO',
        STATUS: 'STATUS',
        SHARE: 'SHARE',
        CLOSE: 'CLOSE',
    };

    constructor({ stateManagerFactory, ...options }) {
        super(options);

        this.stateManagerFactory = stateManagerFactory;
        this.stateManager = null;

        this.initConfig(this.policiesConfigs.replicaDiscovery);
    }

    async start() {
        await super.start();
        this.initPolicy();

        await this.startPromise;
        this.scheduleResyncTask(this.discoveryInterval);
    }

    async stop() {
        clearInterval(this.resyncInterval);

        await super.stop();

        await this.marketsManager.stop();
    }

    async handleChannelTeardown(...args) {
        await super.handleChannelTeardown(...args);

        await this.broadcastClose();
    }

    async process({ type, data, from }) {
        switch (type) {
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO: {
                return this.handleHelloMessage({ data, from });
            }
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS: {
                return this.statusMessageBuffer.addMessage({ data, from });
            }
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE: {
                return this.shareMessageBuffer.addMessage({ data, from });
            }
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.CLOSE: {
                return this.closeMessageBuffer.addMessage({ data, from });
            }
        }
    }

    async handleHelloMessage({ from }) {
        return this.amqpClient.sendToQueue(from.address, {
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS,
            data: this.stateManager.getCurrentState(),
            from: this.getSenderCredentials(),
        });
    }

    async handleStatusMessage() {
        const replicaStatus = this.stateManager.aggregateState(
            this.statusMessageBuffer.useBuffer(),
        );

        await this.handleTargetStart(replicaStatus);
        await this.broadcastShare(replicaStatus);
    }

    async handleShareMessage() {
        await this.interPhaseMutex.acquire();
        this.interPhaseMutex.addTimeout(this.marketsManager.getReloadTime());

        try {
            const replicaState = this.stateManager.aggregateShareState(
                this.shareMessageBuffer.useBuffer(),
            );

            if (this.stateManager.shouldReload(replicaState)) {
                this.stateManager.updateState(replicaState);

                await this.marketsManager.reloadActive(
                    this.stateManager.normalizeState(replicaState),
                );
            }
        } finally {
            this.interPhaseMutex.release();
        }
    }

    async handleCloseMessage() {
        await this.interPhaseMutex.acquire();
        this.interPhaseMutex.addTimeout(this.marketsManager.getReloadTime());

        try {
            const replicaStatus = this.stateManager.aggregateCloseState(
                this.closeMessageBuffer.useBuffer(),
            );

            await this.marketsManager.reloadActive(
                this.stateManager.normalizeState(replicaStatus),
            );
        } finally {
            this.interPhaseMutex.release();
        }
    }

    async broadcastHello() {
        await this.interPhaseMutex.acquire();

        await this.broadcast({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO,
            from: this.getSenderCredentials(),
        });
    }

    async broadcastShare(status) {
        await this.broadcast({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE,
            data: status,
            from: this.getSenderCredentials(),
        });

        this.interPhaseMutex.release();
    }

    async broadcastClose() {
        await this.broadcast({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.CLOSE,
            from: this.getSenderCredentials(),
        });
    }

    async handleTargetStart(replicaStatus) {
        if (this.hasStarted) return;

        await this.marketsManager.start(
            this.stateManager.normalizeState(replicaStatus),
        );

        this.resolveStartPromise();
        this.hasStarted = true;
    }

    initPolicy() {
        this.initPhaseControl();
        this.initStateManager();

        this.scheduleGreeting(this.initializationDelay);
    }

    initConfig({
        initializationDelay,
        statusDebounceDelay,
        shareDebounceDelay,
        closeDebounceDelay,
        phaseReleaseDelay,
        discoveryInterval,
    }) {
        this.statusMessageBuffer = new MessageBuffer(
            this.handleStatusMessage.bind(this),
            statusDebounceDelay,
        );
        this.shareMessageBuffer = new MessageBuffer(
            this.handleShareMessage.bind(this),
            shareDebounceDelay,
        );
        this.closeMessageBuffer = new MessageBuffer(
            this.handleCloseMessage.bind(this),
            closeDebounceDelay,
        );

        this.initializationDelay = initializationDelay;
        this.discoveryInterval = discoveryInterval;
        this.phaseReleaseDelay = phaseReleaseDelay;
    }

    initPhaseControl() {
        this.hasStarted = false;
        this.startPromise = new Promise(
            (resolve) => (this.resolveStartPromise = resolve),
        );
        this.interPhaseMutex = new TimeoutMutex(this.phaseReleaseDelay);
    }

    initStateManager() {
        this.stateManager = this.stateManagerFactory.create({
            marketsManager: this.marketsManager,
            replicaDiscoveryPolicy: this,
        });
    }

    scheduleGreeting(delay) {
        setTimeout(this.broadcastHello.bind(this), delay);
    }

    scheduleResyncTask(interval) {
        this.resyncInterval = setInterval(
            this.broadcastHello.bind(this),
            interval,
        );
    }

    getSenderCredentials() {
        return {
            address: this.getPrivateQueueAddress(),
            identity: this.marketsManager.getIdentity(),
        };
    }
}

export default ReplicaDiscoveryPolicy;
