import ClusterMember from '#domain-collectors/infrastructure/ClusterMember.js';
import ClusterMembersStateManagerReducer from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/reducers/ClusterMembersStateManagerReducer.js';

describe('[domain-collectors/infrastructure]: ClusterMembersStateManagerReducer Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.mockMarketsManager = {
            getInternalScheduler: jest.fn().mockReturnValue({
                getIntervalSize: jest.fn().mockReturnValue(5000),
            }),
            getIdentity: jest.fn().mockReturnValue('mock-identity'),
        };

        context.replicaDiscoveryPolicy = {
            getPrivateQueueAddress() {
                return 'test-address';
            },
        };

        context.clusterMembersPlugin = new ClusterMembersStateManagerReducer({
            marketsManager: context.mockMarketsManager,
            replicaDiscoveryPolicy: context.replicaDiscoveryPolicy,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('constructor initializes clusterMembers as empty array', () => {
        expect(context.clusterMembersPlugin.clusterMembers).toEqual(null);
    });

    test('getCurrentState returns the correct cluster member interval', () => {
        const currentState = context.clusterMembersPlugin.getCurrentState();
        expect(currentState).toEqual({ clusterMemberInterval: 5000 });
    });

    test('aggregateState aggregates and sorts cluster members from the status message buffer', () => {
        const statusMessageBuffer = [
            {
                from: { address: 'member3', identity: 'id3' },
                data: { clusterMemberInterval: 1000 },
            },
            {
                from: { address: 'member1', identity: 'id1' },
                data: { clusterMemberInterval: 2000 },
            },
            {
                from: { address: 'member2', identity: 'id2' },
                data: { clusterMemberInterval: 1500 },
            },
        ];

        const aggregatedState =
            context.clusterMembersPlugin.aggregateState(statusMessageBuffer);

        expect(aggregatedState).toEqual({
            clusterMembers: [
                { address: 'member1', identity: 'id1', interval: 2000 },
                { address: 'member2', identity: 'id2', interval: 1500 },
                { address: 'member3', identity: 'id3', interval: 1000 },
            ],
        });
    });

    test('aggregateState should not change internal state', () => {
        const statusMessageBuffer = [
            {
                from: { address: 'member3', identity: 'id3' },
                data: { clusterMemberInterval: 1000 },
            },
            {
                from: { address: 'member1', identity: 'id1' },
                data: { clusterMemberInterval: 2000 },
            },
            {
                from: { address: 'member2', identity: 'id2' },
                data: { clusterMemberInterval: 1500 },
            },
        ];

        const clusterState = 'test';

        const expectedResult = {
            clusterMembers: [
                { address: 'member1', identity: 'id1', interval: 2000 },
                { address: 'member2', identity: 'id2', interval: 1500 },
                { address: 'member3', identity: 'id3', interval: 1000 },
            ],
        };

        context.clusterMembersPlugin.clusterMembers = clusterState;

        const aggregatedState =
            context.clusterMembersPlugin.aggregateState(statusMessageBuffer);

        expect(aggregatedState).toEqual(expectedResult);
        expect(context.clusterMembersPlugin.clusterMembers).toEqual(
            clusterState,
        );
    });

    test('normalizeState returns the correct state with hydrated cluster members', () => {
        const clusterMembers = [
            { identity: 'id1', interval: 2000 },
            { identity: 'id2', interval: 1500 },
            { identity: 'id3', interval: 1000 },
        ];

        const normalizedState = context.clusterMembersPlugin.normalizeState({
            clusterMembers,
        });

        expect(normalizedState).toEqual({
            clusterMembers: ClusterMember.hydrateList([
                { identity: 'id1', type: 'EXTERNAL', interval: 2000 },
                { identity: 'id2', type: 'EXTERNAL', interval: 1500 },
                { identity: 'id3', type: 'EXTERNAL', interval: 1000 },
            ]),
        });
    });

    test('sanitizeShareState returns the correct cluster members data', () => {
        const clusterMembers = [
            { identity: 'id1', interval: 2000 },
            { identity: 'id2', interval: 1500 },
        ];

        const sanitizedMessage =
            context.clusterMembersPlugin.sanitizeShareState(clusterMembers);

        expect(sanitizedMessage).toEqual(clusterMembers);
    });

    test('shouldReload returns true if clusterMembers have changed', () => {
        context.clusterMembersPlugin.clusterMembers = [
            { identity: 'id1', interval: 2000 },
        ];
        const newState = {
            clusterMembers: [
                { identity: 'id1', interval: 2000 },
                { identity: 'id2', interval: 1500 },
            ],
        };

        const shouldReload =
            context.clusterMembersPlugin.shouldReload(newState);

        expect(shouldReload).toBe(true);
    });

    test('shouldReload returns false if clusterMembers have not changed', () => {
        context.clusterMembersPlugin.clusterMembers = [
            { identity: 'id1', interval: 2000 },
        ];
        const newState = {
            clusterMembers: [{ identity: 'id1', interval: 2000 }],
        };

        const shouldReload =
            context.clusterMembersPlugin.shouldReload(newState);

        expect(shouldReload).toBe(false);
    });

    test('shouldReload returns false if clusterMembers is not provided', () => {
        const shouldReload = context.clusterMembersPlugin.shouldReload({});

        expect(shouldReload).toBe(false);
    });

    test('updateState updates the clusterMembers correctly', () => {
        const newState = {
            clusterMembers: [
                { identity: 'id1', interval: 2000 },
                { identity: 'id2', interval: 1500 },
            ],
        };
        context.clusterMembersPlugin.updateState(newState);

        expect(context.clusterMembersPlugin.clusterMembers).toEqual(
            newState.clusterMembers,
        );
    });

    test('updateState does not update clusterMembers if not provided', () => {
        context.clusterMembersPlugin.clusterMembers = [
            { identity: 'id1', interval: 2000 },
        ];
        context.clusterMembersPlugin.updateState({});

        expect(context.clusterMembersPlugin.clusterMembers).toEqual([
            { identity: 'id1', interval: 2000 },
        ]);
    });

    test('aggregateCloseState removes closed cluster members correctly', () => {
        context.clusterMembersPlugin.clusterMembers = [
            { address: 'member1', identity: 'id1' },
            { address: 'member2', identity: 'id2' },
            { address: 'member3', identity: 'id3' },
        ];
        const closeMessageBuffer = [
            { from: { address: 'member2', identity: 'id2' } },
        ];

        const aggregatedCloseState =
            context.clusterMembersPlugin.aggregateCloseState(
                closeMessageBuffer,
            );

        expect(aggregatedCloseState).toEqual({
            clusterMembers: [
                { address: 'member1', identity: 'id1' },
                { address: 'member3', identity: 'id3' },
            ],
        });
    });

    test('normalizeState should create a normalized state with hydrated cluster members', () => {
        context.mockMarketsManager.getIdentity.mockReturnValue('member1');

        const clusterMembers = [
            { identity: 'member1', interval: 5000 },
            { identity: 'member2', interval: 10000 },
            { identity: 'member1', interval: 15000 },
        ];

        const expectedHydratedMembers = [
            new ClusterMember({
                identity: 'member1',
                type: ClusterMember.TYPES.SELF,
                interval: 20000,
            }),
            new ClusterMember({
                identity: 'member2',
                type: ClusterMember.TYPES.EXTERNAL,
                interval: 10000,
            }),
        ];

        const normalizedState = context.clusterMembersPlugin.normalizeState({
            clusterMembers,
        });

        expect(normalizedState).toEqual({
            clusterMembers: expectedHydratedMembers,
        });
    });

    test('aggregateShareState aggregates and sorts unique cluster members correctly', () => {
        const shareMessageBuffer = [
            {
                from: { address: 'member1', identity: 'id1' },
                data: {
                    clusterMembers: [
                        { address: 'member1', interval: 1000 },
                        { address: 'member2', interval: 1100 },
                        { address: 'member3', interval: 1200 },
                    ],
                },
            },
            {
                from: { address: 'member2', identity: 'id1' },
                data: {
                    clusterMembers: [
                        { address: 'member1', interval: 2000 },
                        { address: 'member2', interval: 2100 },
                        { address: 'member3', interval: 2200 },
                    ],
                },
            },
            {
                from: { address: 'member3', identity: 'id2' },
                data: {
                    clusterMembers: [
                        { address: 'member1', interval: 3000 },
                        { address: 'member2', interval: 3100 },
                        { address: 'member3', interval: 3200 },
                    ],
                },
            },
        ];

        const aggregatedShareState =
            context.clusterMembersPlugin.aggregateShareState(
                shareMessageBuffer,
            );

        expect(aggregatedShareState).toEqual({
            clusterMembers: [
                { address: 'member1', interval: 1000 },
                { address: 'member2', interval: 2100 },
                { address: 'member3', interval: 3200 },
            ],
        });
    });

    test('aggregateShareState handles empty shareMessageBuffer correctly', () => {
        const shareMessageBuffer = [];

        const aggregatedShareState =
            context.clusterMembersPlugin.aggregateShareState(
                shareMessageBuffer,
            );

        expect(aggregatedShareState).toEqual({ clusterMembers: [] });
    });

    test('aggregateShareState prioritizes latest message from same address', () => {
        const shareMessageBuffer = [
            {
                from: { address: 'member1', identity: 'id1' },
                data: {
                    clusterMembers: [
                        { address: 'member1', interval: 1000 },
                        { address: 'member2', interval: 1100 },
                        { address: 'member3', interval: 1200 },
                    ],
                },
            },
            {
                from: { address: 'member2', identity: 'id1' },
                data: {
                    clusterMembers: [
                        { address: 'member1', interval: 2000 },
                        { address: 'member2', interval: 2100 },
                        { address: 'member3', interval: 2200 },
                    ],
                },
            },
            {
                from: { address: 'member4', identity: 'id2' },
                data: {
                    clusterMembers: [
                        { address: 'member1', interval: 3000 },
                        { address: 'member2', interval: 3100 },
                        { address: 'member3', interval: 3200 },
                    ],
                },
            },
        ];

        const aggregatedShareState =
            context.clusterMembersPlugin.aggregateShareState(
                shareMessageBuffer,
            );

        expect(aggregatedShareState).toEqual({
            clusterMembers: [
                { address: 'member1', interval: 1000 },
                { address: 'member2', interval: 2100 },
                { address: 'member3', interval: 3200 },
            ],
        });
    });
});
