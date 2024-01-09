import objectHash from 'object-hash';
import BaseAMQPPolicy from './BaseAMQPPolicy.js';

class ReplicaDiscoveryPolicy extends BaseAMQPPolicy {
    static PROTOCOL_STATUSES = {
        INITIALIZING: 0,
        DEBATING: 1,
        RUNNING: 2,
    };

    static MESSAGE_TYPES = {
        HELLO: 'HELLO',
        STATUS: 'STATUS',
        SHARE: 'SHARE',
    };

    constructor({ rabbitGroupName, replicaDiscovery, ...options }) {
        super({ rabbitGroupName: `${rabbitGroupName}::status`, ...options });

        this.replicaDiscovery = replicaDiscovery;
        this.messageBuffer = [];
        this.debounceTimeout = null;
        this.currentStatus = {};
        this.currentProtocolStatus = ReplicaDiscoveryPolicy.INITIALIZING;
    }

    async start() {
        await super.start();

        setTimeout(async () => {
            this.broadcast({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO,
                data: { statusUpdateQueue: this.getPrivateQueueAddress() },
            });

            this.setProtocolStatus(ReplicaDiscoveryPolicy.DEBATING);
        }, this.replicaDiscovery.initializationDelay);
    }

    async consumer(message) {
        const { type, data } = JSON.parse(message.content.toString());

        switch (type) {
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO: {
                return this.helloConsumer(data);
            }
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS: {
                return this.statusConsumer(data);
            }
            case ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE: {
                return this.shareConsumer(data);
            }
        }
    }

    async helloConsumer({ statusUpdateQueue }) {
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

    async statusConsumer(data) {
        this.messageBuffer.push(data);

        if (this.debounceTimeout) clearTimeout(this.debounceTimeout);

        this.debounceTimeout = setTimeout(async () => {
            this.aggregateCurrentStatus();

            await this.amqpManagementTarget.startHandler({
                rateLimitMultiplier: this.currentStatus.rateLimitMultiplier,
                replicaConfig: this.getReplicaConfig(
                    this.currentStatus.replicaMembers,
                ),
            });
            await this.broadcast({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE,
                data: {
                    status: this.currentStatus,
                    from: {
                        address: this.getPrivateQueueAddress(),
                        identity: this.amqpManagementTarget.identity,
                    },
                },
            });

            this.messageBuffer = [];
            this.setProtocolStatus(ReplicaDiscoveryPolicy.RUNNING);
        }, this.replicaDiscovery.debounceDelay);
    }

    async shareConsumer(data) {
        if (!this.shouldCallReloadHandler(data)) return;

        return this.amqpManagementTarget.reloadHandler({
            rateLimitMultiplier: data.status.rateLimitMultiplier,
            replicaConfig: this.getReplicaConfig(data.status.replicaMembers),
        });
    }

    getReplicaConfig(replicaMembers) {
        return {
            replicaSize: replicaMembers.length,
            instancePosition: replicaMembers.indexOf(
                this.getPrivateQueueAddress(),
            ),
        };
    }

    aggregateCurrentStatus() {
        this.currentStatus = {
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

    shouldCallReloadHandler(data) {
        const notSelfSentMessage =
            data.from.address !== this.getPrivateQueueAddress();

        const isNotCurrentlyInitializing =
            this.currentProtocolStatus >
            ReplicaDiscoveryPolicy.PROTOCOL_STATUSES.INITIALIZING;

        const rateLimitIsNotLowerThanCurrent =
            data.status.rateLimitMultiplier >=
            this.amqpManagementTarget.getStatusHandler().rateLimitMultiplier;

        const statusHasChanged =
            objectHash(data.status) !== objectHash(this.currentStatus);

        return (
            notSelfSentMessage &&
            isNotCurrentlyInitializing &&
            rateLimitIsNotLowerThanCurrent &&
            statusHasChanged
        );
    }

    setProtocolStatus(status) {
        this.currentProtocolStatus = status;
    }
}

export default ReplicaDiscoveryPolicy;
