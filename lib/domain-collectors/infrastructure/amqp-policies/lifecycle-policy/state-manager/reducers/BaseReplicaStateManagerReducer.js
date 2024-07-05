class BaseReplicaStateManagerReducer {
    constructor({ marketsManager, address }) {
        this.marketsManager = marketsManager;
        this.address = address;
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
