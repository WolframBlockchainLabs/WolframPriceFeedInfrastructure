import ClusterMember from '#domain-collectors/utils/ClusterMember.js';
import BaseReplicaStateManagerReducer from './BaseReplicaStateManagerReducer.js';

class ClusterMembersStateManagerReducer extends BaseReplicaStateManagerReducer {
    constructor(options) {
        super(options);

        this.clusterMembers = null;
    }

    getCurrentState() {
        return {
            clusterMemberInterval: this.marketsManager
                .getInternalScheduler()
                .getIntervalSize(),
        };
    }

    aggregateState(statusMessageBuffer) {
        const clusterMembers = statusMessageBuffer
            .map((message) => ({
                ...message.from,
                interval: message.data.clusterMemberInterval,
            }))
            .sort((a, b) => a.address.localeCompare(b.address));

        if (!this.clusterMembers) {
            this.clusterMembers = clusterMembers;
        }

        return { clusterMembers };
    }

    normalizeState({ clusterMembers }) {
        const identityMap = this.#getIdentityMap(clusterMembers);

        const dryClusterMembers = Array.from(identityMap.values()).sort(
            (a, b) => a.identity.localeCompare(b.identity),
        );

        return {
            clusterMembers: ClusterMember.hydrateList(dryClusterMembers),
        };
    }

    aggregateShareState(shareMessageBuffer) {
        const uniqueMembers = new Map();

        shareMessageBuffer.reverse().forEach((message) => {
            const fromAddress = message.from.address;

            message.data.clusterMembers.forEach((member) => {
                const memberAddress = member.address;
                const existingMember = uniqueMembers.get(memberAddress);

                if (!existingMember || fromAddress === memberAddress) {
                    uniqueMembers.set(memberAddress, member);
                }
            });
        });

        const clusterMembers = Array.from(uniqueMembers.values()).sort((a, b) =>
            a.address.localeCompare(b.address),
        );

        return {
            clusterMembers,
        };
    }

    sanitizeShareState({ clusterMembers }) {
        const areValidMembers =
            clusterMembers?.length &&
            clusterMembers.find(
                (clusterMember) => clusterMember.address === this.getAddress(),
            );

        return {
            ...(areValidMembers && {
                clusterMembers,
            }),
        };
    }

    shouldReload({ clusterMembers }) {
        if (!clusterMembers) return false;

        return (
            JSON.stringify(clusterMembers) !==
            JSON.stringify(this.clusterMembers)
        );
    }

    updateState({ clusterMembers }) {
        if (!clusterMembers) return;

        this.clusterMembers = clusterMembers;
    }

    aggregateCloseState(closeMessageBuffer) {
        const closeAddressesSet = new Set(
            closeMessageBuffer.map((closeMessage) => closeMessage.from.address),
        );

        this.clusterMembers = this.clusterMembers.filter(
            (incumbentMember) =>
                !closeAddressesSet.has(incumbentMember.address),
        );

        return { clusterMembers: this.clusterMembers };
    }

    #getIdentityMap(clusterMembers) {
        return clusterMembers.reduce((map, clusterMember) => {
            const { identity, interval } = clusterMember;

            if (map.has(identity)) {
                map.get(identity).interval += interval;
            } else {
                map.set(identity, {
                    identity,
                    type:
                        identity === this.marketsManager.getIdentity()
                            ? ClusterMember.TYPES.SELF
                            : ClusterMember.TYPES.EXTERNAL,
                    interval,
                });
            }

            return map;
        }, new Map());
    }
}

export default ClusterMembersStateManagerReducer;
