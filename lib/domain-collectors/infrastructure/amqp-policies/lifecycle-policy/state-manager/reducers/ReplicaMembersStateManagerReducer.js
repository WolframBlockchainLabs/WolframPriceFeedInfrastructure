import BaseReplicaStateManagerReducer from './BaseReplicaStateManagerReducer.js';

class ReplicaMembersStateManagerReducer extends BaseReplicaStateManagerReducer {
    constructor(options) {
        super(options);

        this.replicaMembers = null;
    }

    aggregateState(statusMessageBuffer) {
        const replicaMembers = statusMessageBuffer
            .filter((message) => {
                return (
                    message.from.identity === this.marketsManager.getIdentity()
                );
            })
            .map((message) => message.from.address)
            .sort();

        if (!this.replicaMembers) {
            this.replicaMembers = replicaMembers;
        }

        return { replicaMembers };
    }

    normalizeState({ replicaMembers }) {
        if (!replicaMembers) return {};

        return {
            replicaSize: replicaMembers.length,
            instancePosition: replicaMembers.indexOf(this.getAddress()),
        };
    }

    aggregateShareState(shareMessageBuffer) {
        const lastState = shareMessageBuffer
            .filter(
                ({ from }) =>
                    from.identity === this.marketsManager.getIdentity(),
            )
            .at(-1);

        return { replicaMembers: lastState.data.replicaMembers };
    }

    shouldReload({ replicaMembers }) {
        if (!replicaMembers) return false;

        return (
            JSON.stringify(replicaMembers) !==
            JSON.stringify(this.replicaMembers)
        );
    }

    updateState({ replicaMembers }) {
        if (!replicaMembers) return;

        this.replicaMembers = replicaMembers;
    }

    aggregateCloseState(closeMessageBuffer) {
        const closeAddressesSet = new Set(
            closeMessageBuffer
                .filter(
                    (message) =>
                        message.from.identity ===
                        this.marketsManager.getIdentity(),
                )
                .map((closeMessage) => closeMessage.from.address),
        );

        this.replicaMembers = this.replicaMembers.filter(
            (incumbentMemberAddress) =>
                !closeAddressesSet.has(incumbentMemberAddress),
        );

        return { replicaMembers: this.replicaMembers };
    }
}

export default ReplicaMembersStateManagerReducer;
