import BaseReplicaStateManagerReducer from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/reducers/BaseReplicaStateManagerReducer.js';

describe('[domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/reducers]: BaseReplicaStateManagerReducer Tests Suite', () => {
    let basePlugin;
    const mockMarketsManager = {};
    const address = 'test-address';

    beforeEach(() => {
        basePlugin = new BaseReplicaStateManagerReducer({
            marketsManager: mockMarketsManager,
            address: address,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('constructor initializes properties correctly', () => {
        expect(basePlugin.marketsManager).toBe(mockMarketsManager);
        expect(basePlugin.address).toBe(address);
    });

    test('getCurrentState returns an empty object', () => {
        expect(basePlugin.getCurrentState()).toEqual({});
    });

    test('aggregateCloseState returns an empty object', () => {
        expect(basePlugin.aggregateCloseState()).toEqual({});
    });

    test('aggregateShareState returns an empty object', () => {
        expect(basePlugin.aggregateShareState([1, 2, 3])).toEqual({});
    });

    test('sanitizeShareState returns what was given by default', () => {
        const state = { replicaSize: 2 };

        expect(basePlugin.sanitizeShareState(state)).toEqual(state);
    });

    test('shouldReload returns false', () => {
        expect(basePlugin.shouldReload()).toEqual(false);
    });

    test('updateState is a function', () => {
        expect(basePlugin.updateState()).toEqual(undefined);
    });

    test('normalizeState returns an empty object', () => {
        expect(basePlugin.normalizeState()).toEqual({});
    });

    test('aggregateState returns an empty object', () => {
        expect(basePlugin.aggregateState()).toEqual({});
    });
});
