class BaseReplicaStateManagerReducer {
    constructor({ marketsManager, replicaDiscoveryPolicy }) {
        this.marketsManager = marketsManager;
        this.replicaDiscoveryPolicy = replicaDiscoveryPolicy;
    }

    getAddress() {
        return this.replicaDiscoveryPolicy.getPrivateQueueAddress();
    }

    getCurrentState() {
        return {};
    }

    aggregateState() {
        return {};
    }

    normalizeState() {
        return {};
    }

    aggregateShareState() {
        return {};
    }

    sanitizeShareState(state) {
        return state;
    }

    shouldReload() {
        return false;
    }

    updateState() {}

    aggregateCloseState() {
        return {};
    }
}

export default BaseReplicaStateManagerReducer;
