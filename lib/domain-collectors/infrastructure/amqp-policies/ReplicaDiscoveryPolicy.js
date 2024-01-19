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
        this.debounceTimeout = null;
        this.hasStarted = false;

        this.currentStatus = {};
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
        const status = await this.amqpManagementTarget.getStatusHandler();

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
            if (!this.shouldCallReloadHandler(data)) return;

            this.currentStatus = data.status;

            await this.amqpManagementTarget.reloadHandler(
                this.getTargetState(data.status),
            );
        } finally {
            reloadMutexRelease();
        }
    }

    async handleStatusUpdate() {
        this.currentStatus = this.calculateCurrentStatus();
        this.messageBuffer = [];

        await this.handleTargetStart(this.currentStatus);
        await this.broadcastShare(this.currentStatus);
    }

    async handleTargetStart(status) {
        if (this.hasStarted) return;

        await this.amqpManagementTarget.startHandler(
            this.getTargetState(status),
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

    shouldCallReloadHandler(data) {
        const statusChanged =
            JSON.stringify(data.status) !== JSON.stringify(this.currentStatus);

        return this.hasStarted && statusChanged;
    }

    getTargetState(status) {
        return {
            rateLimitMultiplier: status.rateLimitMultiplier,
            replicaConfig: {
                replicaSize: status.replicaMembers.length,
                instancePosition: status.replicaMembers.indexOf(
                    this.getPrivateQueueAddress(),
                ),
            },
        };
    }

    calculateCurrentStatus() {
        return {
            rateLimitMultiplier: Math.max(
                ...this.messageBuffer.map(
                    (message) => message.status.rateLimitMultiplier,
                ),
            ),
            replicaMembers: this.messageBuffer
                .filter(
                    (message) =>
                        message.from.identity ===
                        this.amqpManagementTarget.identity,
                )
                .map((message) => message.from.address)
                .sort(),
        };
    }
}

export default ReplicaDiscoveryPolicy;
