class ReplicaStateManager {
    constructor({ Reducers, marketsManager, replicaDiscoveryPolicy }) {
        this.Reducers = Reducers;
        this.reducers = [];

        this.marketsManager = marketsManager;
        this.replicaDiscoveryPolicy = replicaDiscoveryPolicy;

        this.init({ marketsManager, replicaDiscoveryPolicy });
    }

    init({ marketsManager, replicaDiscoveryPolicy }) {
        this.reducers = this.Reducers.map((Plugin) => {
            return new Plugin({
                marketsManager,
                replicaDiscoveryPolicy,
            });
        });
    }

    getCurrentState() {
        return this.reducers.reduce((state, stateManager) => {
            const partialState = stateManager.getCurrentState();

            return {
                ...state,
                ...partialState,
            };
        }, {});
    }

    aggregateState(statusMessageBuffer) {
        return this.reducers.reduce((state, stateManager) => {
            const partialState =
                stateManager.aggregateState(statusMessageBuffer);

            return {
                ...state,
                ...partialState,
            };
        }, {});
    }

    normalizeState(replicaState) {
        return this.reducers.reduce((state, stateManager) => {
            const partialState = stateManager.normalizeState(replicaState);

            return {
                ...state,
                ...partialState,
            };
        }, {});
    }

    aggregateShareState(shareMessageBuffer) {
        const aggregatedState = this.reducers.reduce((state, stateManager) => {
            const partialState =
                stateManager.aggregateShareState(shareMessageBuffer);

            return {
                ...state,
                ...partialState,
            };
        }, {});

        return this.sanitizeShareState(aggregatedState);
    }

    sanitizeShareState(shareMessage) {
        return this.reducers.reduce((message, stateManager) => {
            const partialMessage =
                stateManager.sanitizeShareState(shareMessage);

            return {
                ...message,
                ...partialMessage,
            };
        }, {});
    }

    shouldReload(state) {
        const reloadVotes = this.reducers.map((stateManager) => {
            return stateManager.shouldReload(state);
        });

        return reloadVotes.some((shouldReload) => shouldReload);
    }

    updateState(state) {
        this.reducers.forEach((stateManager) => {
            return stateManager.updateState(state);
        });

        return state;
    }

    aggregateCloseState(closeMessageBuffer) {
        const closeState = this.reducers.reduce((state, stateManager) => {
            const partialState =
                stateManager.aggregateCloseState(closeMessageBuffer);

            return {
                ...state,
                ...partialState,
            };
        }, {});

        return this.updateState(closeState);
    }
}

export default ReplicaStateManager;
