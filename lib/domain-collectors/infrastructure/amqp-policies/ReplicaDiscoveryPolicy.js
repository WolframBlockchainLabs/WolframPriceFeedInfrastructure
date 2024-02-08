import { Mutex } from 'async-mutex';
import BaseAMQPPolicy from './BaseAMQPPolicy.js';
import Cron from 'croner';

class ReplicaDiscoveryPolicy extends BaseAMQPPolicy {
    static MESSAGE_TYPES = {
        HELLO: 'HELLO',
        STATUS: 'STATUS',
        SHARE: 'SHARE',
    };

    constructor({ rabbitGroupName, replicaDiscovery, ...options }) {
        super({ rabbitGroupName: `${rabbitGroupName}::discovery`, ...options });

        this.validateConfig(replicaDiscovery);
        this.replicaDiscovery = replicaDiscovery;

        this.messageBuffer = [];
        this.replicaMembers = [];
        this.debounceTimeout = null;
        this.hasStarted = false;

        this.startPromise = new Promise(
            (resolve) => (this.resolveStartPromise = resolve),
        );
        this.reloadMutex = new Mutex();
    }

    async start() {
        await super.start();
        this.scheduleGreeting(this.replicaDiscovery.initializationDelay);

        await this.startPromise;
        this.scheduleCronTask(this.replicaDiscovery.discoveryInterval);
    }

    async consumer(message) {
        const { type, data } = JSON.parse(message.content.toString());

        switch (type) {
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO:
                return this.handleHelloMessage(data);
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS:
                return this.handleStatusMessage(data);
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE:
                return this.handleShareMessage(data);
        }
    }

    validateConfig({ initializationDelay, debounceDelay }) {
        if (initializationDelay < debounceDelay) {
            throw new Error(
                'Initialization delay must be greater than or equal to debounce delay.',
            );
        }
    }

    scheduleGreeting(delay) {
        setTimeout(this.broadcastHello.bind(this), delay);
    }

    scheduleCronTask(interval) {
        this.cronTask = Cron(interval, this.broadcastHello.bind(this));
    }

    async handleHelloMessage({ statusUpdateQueue }) {
        const status = this.amqpManagementTarget.getStatusHandler();

        return this.amqpClient.publish(statusUpdateQueue, {
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS,
            data: {
                status,
                from: {
                    address: this.getPrivateQueueAddress(),
                    identity: this.amqpManagementTarget.identity,
                },
            },
        });
    }

    async handleStatusMessage(data) {
        this.messageBuffer.push(data);

        if (this.debounceTimeout) clearTimeout(this.debounceTimeout);

        this.debounceTimeout = setTimeout(
            this.handleStatusUpdate.bind(this),
            this.replicaDiscovery.debounceDelay,
        );
    }

    async handleShareMessage(data) {
        const reloadMutexRelease = await this.reloadMutex.acquire();

        try {
            const replicaState = this.validateShareMessage(data);

            if (!this.shouldCallReloadHandler(replicaState)) return;

            await this.amqpManagementTarget.reloadHandler(
                this.getTargetState(replicaState),
            );

            this.replicaMembers = replicaState.replicaMembers;
        } finally {
            reloadMutexRelease();
        }
    }

    async handleStatusUpdate() {
        const replicaStatus = this.aggregateReplicaStatus();

        this.replicaMembers = replicaStatus.replicaMembers;
        this.messageBuffer = [];

        await this.handleTargetStart(replicaStatus);
        await this.broadcastShare(replicaStatus);
    }

    async handleTargetStart(replicaStatus) {
        if (this.hasStarted) return;

        await this.amqpManagementTarget.startHandler(
            this.getTargetState(replicaStatus),
        );

        this.resolveStartPromise();
        this.hasStarted = true;
    }

    async broadcastHello() {
        await this.broadcast({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO,
            data: { statusUpdateQueue: this.getPrivateQueueAddress() },
        });
    }

    async broadcastShare(status) {
        await this.broadcast({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE,
            data: {
                status,
                from: {
                    address: this.getPrivateQueueAddress(),
                    identity: this.amqpManagementTarget.identity,
                },
            },
        });
    }

    validateShareMessage({ status, from }) {
        const targetStatus = this.amqpManagementTarget.getStatusHandler();

        const isValidRateLimit =
            status.rateLimitMultiplier > targetStatus.rateLimitMultiplier;

        const isOwnReplica =
            from.identity === this.amqpManagementTarget.identity;

        return {
            ...(isOwnReplica && { replicaMembers: status.replicaMembers }),
            ...(isValidRateLimit && {
                rateLimitMultiplier: status.rateLimitMultiplier,
            }),
        };
    }

    shouldCallReloadHandler({ replicaMembers, rateLimitMultiplier }) {
        const targetStatus = this.amqpManagementTarget.getStatusHandler();

        const replicaMembersChanged =
            replicaMembers &&
            JSON.stringify(replicaMembers) !==
                JSON.stringify(this.replicaMembers);

        const rateLimitHasChanged =
            rateLimitMultiplier &&
            rateLimitMultiplier > targetStatus.rateLimitMultiplier;

        return (
            this.hasStarted && (replicaMembersChanged || rateLimitHasChanged)
        );
    }

    getTargetState(replicaStatus) {
        return {
            rateLimitMultiplier: replicaStatus.rateLimitMultiplier,
            replicaConfig: {
                replicaSize: replicaStatus.replicaMembers.length,
                instancePosition: replicaStatus.replicaMembers.indexOf(
                    this.getPrivateQueueAddress(),
                ),
            },
        };
    }

    aggregateReplicaStatus() {
        return {
            replicaMembers: this.messageBuffer
                .filter(
                    (message) =>
                        message.from.identity ===
                        this.amqpManagementTarget.identity,
                )
                .map((message) => message.from.address)
                .sort(),
            rateLimitMultiplier: Math.max(
                ...this.messageBuffer.map(
                    (message) => message.status.rateLimitMultiplier,
                ),
            ),
        };
    }
}

export default ReplicaDiscoveryPolicy;
