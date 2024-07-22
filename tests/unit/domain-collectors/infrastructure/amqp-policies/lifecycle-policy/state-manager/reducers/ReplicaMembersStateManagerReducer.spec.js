import ReplicaMembersStateManagerReducer from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/reducers/ReplicaMembersStateManagerReducer.js';

describe('[domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/reducers]: ReplicaMembersStateManagerReducer Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.mockMarketsManager = {
            getIdentity: jest.fn().mockReturnValue('mock-identity'),
        };
        context.replicaDiscoveryPolicy = {
            getPrivateQueueAddress() {
                return 'test-address';
            },
        };

        context.replicaMembersPlugin = new ReplicaMembersStateManagerReducer({
            marketsManager: context.mockMarketsManager,
            replicaDiscoveryPolicy: context.replicaDiscoveryPolicy,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('constructor initializes replicaMembers as empty array', () => {
        expect(context.replicaMembersPlugin.replicaMembers).toEqual(null);
    });

    test('sanitizeShareState returns same object', () => {
        const state = { replicaMembers: ['test-address', 'member2'] };

        const sanitizedMessage =
            context.replicaMembersPlugin.sanitizeShareState(state);

        expect(sanitizedMessage).toEqual(state);
    });

    test('shouldReload returns true if replicaMembers have changed', () => {
        context.replicaMembersPlugin.replicaMembers = ['member1', 'member2'];
        const newState = { replicaMembers: ['member1', 'member2', 'member3'] };

        const shouldReload =
            context.replicaMembersPlugin.shouldReload(newState);

        expect(shouldReload).toBe(true);
    });

    test('shouldReload returns false if replicaMembers have not changed', () => {
        context.replicaMembersPlugin.replicaMembers = ['member1', 'member2'];
        const newState = { replicaMembers: ['member1', 'member2'] };

        const shouldReload =
            context.replicaMembersPlugin.shouldReload(newState);

        expect(shouldReload).toBe(false);
    });

    test('updateState updates the replicaMembers correctly', () => {
        const newState = { replicaMembers: ['member1', 'member2', 'member3'] };
        context.replicaMembersPlugin.updateState(newState);

        expect(context.replicaMembersPlugin.replicaMembers).toEqual(
            newState.replicaMembers,
        );
    });

    test('normalizeState returns replica configuration', () => {
        const state = {
            replicaMembers: ['test-address', 'member2', 'member3'],
        };

        const normalizedState =
            context.replicaMembersPlugin.normalizeState(state);

        expect(normalizedState).toEqual({
            replicaSize: 3,
            instancePosition: 0,
        });
    });

    test('normalizeState returns empty object if replicaMembers is not provided', () => {
        const state = {};

        const normalizedState =
            context.replicaMembersPlugin.normalizeState(state);

        expect(normalizedState).toEqual({});
    });

    test('aggregateState aggregates and sorts replica members from the status message buffer', () => {
        const statusMessageBuffer = [
            { from: { identity: 'mock-identity', address: 'member3' } },
            { from: { identity: 'different-identity', address: 'member4' } },
            { from: { identity: 'mock-identity', address: 'member1' } },
        ];

        const aggregatedState =
            context.replicaMembersPlugin.aggregateState(statusMessageBuffer);

        expect(aggregatedState).toEqual({
            replicaMembers: ['member1', 'member3'],
        });
    });

    test('aggregateState aggregates and sorts replica members from the status message buffer', () => {
        const statusMessageBuffer = [
            { from: { identity: 'mock-identity', address: 'member3' } },
            { from: { identity: 'different-identity', address: 'member4' } },
            { from: { identity: 'mock-identity', address: 'member1' } },
        ];

        const clusterState = 'test';

        const expectedResult = {
            replicaMembers: ['member1', 'member3'],
        };

        context.replicaMembersPlugin.replicaMembers = clusterState;

        const aggregatedState =
            context.replicaMembersPlugin.aggregateState(statusMessageBuffer);

        expect(aggregatedState).toEqual(expectedResult);
        expect(context.replicaMembersPlugin.replicaMembers).toEqual(
            clusterState,
        );
    });

    test('aggregateCloseState removes closed replica members correctly', () => {
        context.replicaMembersPlugin.replicaMembers = [
            'member1',
            'member2',
            'member3',
        ];
        const closeMessageBuffer = [
            { from: { identity: 'mock-identity', address: 'member2' } },
        ];

        const aggregatedCloseState =
            context.replicaMembersPlugin.aggregateCloseState(
                closeMessageBuffer,
            );

        expect(aggregatedCloseState).toEqual({
            replicaMembers: ['member1', 'member3'],
        });
    });

    test('shouldReload returns false if replicaMembers is not provided', () => {
        const shouldReload = context.replicaMembersPlugin.shouldReload({});

        expect(shouldReload).toBe(false);
    });

    test('shouldReload returns false if replicaMembers is null', () => {
        const shouldReload = context.replicaMembersPlugin.shouldReload({
            replicaMembers: null,
        });

        expect(shouldReload).toBe(false);
    });

    test('updateState does not update replicaMembers if not provided', () => {
        context.replicaMembersPlugin.replicaMembers = ['member1', 'member2'];
        context.replicaMembersPlugin.updateState({});

        expect(context.replicaMembersPlugin.replicaMembers).toEqual([
            'member1',
            'member2',
        ]);
    });

    test('updateState does not update replicaMembers if replicaMembers is null', () => {
        context.replicaMembersPlugin.replicaMembers = ['member1', 'member2'];
        context.replicaMembersPlugin.updateState({ replicaMembers: null });

        expect(context.replicaMembersPlugin.replicaMembers).toEqual([
            'member1',
            'member2',
        ]);
    });

    test('aggregateShareState aggregates the last state correctly', () => {
        const shareMessageBuffer = [
            {
                from: { identity: 'mock-identity', address: 'member1' },
                data: { replicaMembers: ['member1', 'member2'] },
            },
            {
                from: { identity: 'mock-identity', address: 'member2' },
                data: { replicaMembers: ['member1', 'member2', 'member3'] },
            },
            {
                from: { identity: 'mock-identity', address: 'member3' },
                data: {
                    replicaMembers: [
                        'member1',
                        'member2',
                        'member3',
                        'member4',
                    ],
                },
            },
        ];

        const aggregatedShareState =
            context.replicaMembersPlugin.aggregateShareState(
                shareMessageBuffer,
            );

        expect(aggregatedShareState).toEqual({
            replicaMembers: ['member1', 'member2', 'member3', 'member4'],
        });
    });
});
