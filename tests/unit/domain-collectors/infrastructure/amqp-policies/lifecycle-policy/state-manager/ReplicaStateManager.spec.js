import ReplicaStateManager from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/ReplicaStateManager.js';
import BaseReplicaStateManagerReducer from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/reducers/BaseReplicaStateManagerReducer.js';

describe('[domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager]: ReplicaStateManager Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.mockReducers = [
            BaseReplicaStateManagerReducer,
            BaseReplicaStateManagerReducer,
        ];
        context.mockMarketsManager = {};
        context.replicaDiscoveryPolicy = {
            getPrivateQueueAddress() {
                return 'test-address';
            },
        };

        context.replicaStateManager = new ReplicaStateManager({
            Reducers: context.mockReducers,
            marketsManager: context.mockMarketsManager,
            replicaDiscoveryPolicy: context.replicaDiscoveryPolicy,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('constructor initializes properties correctly', () => {
        expect(context.replicaStateManager.Reducers).toEqual(
            context.mockReducers,
        );
        expect(context.replicaStateManager.marketsManager).toBe(
            context.mockMarketsManager,
        );
        expect(context.replicaStateManager.replicaDiscoveryPolicy).toBe(
            context.replicaDiscoveryPolicy,
        );
        expect(context.replicaStateManager.reducers.length).toBe(
            context.mockReducers.length,
        );
    });

    test('getCurrentState aggregates states from all reducers', () => {
        context.replicaStateManager.reducers.forEach((reducer) => {
            jest.spyOn(reducer, 'getCurrentState').mockReturnValue({
                someState: 'value',
            });
        });

        const state = context.replicaStateManager.getCurrentState();
        expect(state).toEqual({ someState: 'value' });
        context.replicaStateManager.reducers.forEach((reducer) => {
            expect(reducer.getCurrentState).toHaveBeenCalled();
        });
    });

    test('shouldReload returns true if any reducer votes to reload', () => {
        context.replicaStateManager.reducers[0].shouldReload = jest
            .fn()
            .mockReturnValue(true);
        context.replicaStateManager.reducers[1].shouldReload = jest
            .fn()
            .mockReturnValue(false);

        expect(context.replicaStateManager.shouldReload({})).toBe(true);
    });

    test('sanitizeShareState aggregates sanitized messages from all reducers', () => {
        context.replicaStateManager.reducers.forEach((reducer, index) => {
            jest.spyOn(reducer, 'sanitizeShareState').mockReturnValue({
                [`sanitizedPart${index}`]: `value${index}`,
            });
        });

        const shareMessage = { originalMessage: 'test' };
        const sanitizedMessage =
            context.replicaStateManager.sanitizeShareState(shareMessage);

        const expectedSanitizedMessage = {
            sanitizedPart0: 'value0',
            sanitizedPart1: 'value1',
        };

        expect(sanitizedMessage).toEqual(expectedSanitizedMessage);

        context.replicaStateManager.reducers.forEach((reducer) => {
            expect(reducer.sanitizeShareState).toHaveBeenCalledWith(
                shareMessage,
            );
        });
    });

    test('updateState calls updateState on each reducer with the given state', () => {
        const state = { key: 'value' };
        context.replicaStateManager.reducers.forEach((reducer) => {
            jest.spyOn(reducer, 'updateState').mockImplementation(() => {});
        });

        context.replicaStateManager.updateState(state);

        context.replicaStateManager.reducers.forEach((reducer) => {
            expect(reducer.updateState).toHaveBeenCalledWith(state);
        });
    });

    test('normalizeState aggregates normalized state from all reducers', () => {
        const replicaState = { someKey: 'someValue' };
        context.replicaStateManager.reducers.forEach((reducer, index) => {
            jest.spyOn(reducer, 'normalizeState').mockReturnValue({
                normalizedPart: `value${index}`,
            });
        });

        const normalizedState =
            context.replicaStateManager.normalizeState(replicaState);

        expect(normalizedState).toEqual({
            normalizedPart: 'value1',
        });

        context.replicaStateManager.reducers.forEach((reducer) => {
            expect(reducer.normalizeState).toHaveBeenCalledWith(replicaState);
        });
    });

    test('aggregateState combines state from all reducers based on statusMessageBuffer', () => {
        const statusMessageBuffer = [{ message: 'test' }];
        context.replicaStateManager.reducers.forEach((reducer, index) => {
            jest.spyOn(reducer, 'aggregateState').mockReturnValue({
                aggregatedPart: `value${index}`,
            });
        });

        const aggregatedState =
            context.replicaStateManager.aggregateState(statusMessageBuffer);

        expect(aggregatedState).toEqual({
            aggregatedPart: 'value1',
        });

        context.replicaStateManager.reducers.forEach((reducer) => {
            expect(reducer.aggregateState).toHaveBeenCalledWith(
                statusMessageBuffer,
            );
        });
    });

    test('aggregateShareState combines state from all reducers based on shareMessageBuffer', () => {
        const shareMessageBuffer = [{ message: 'test' }];
        context.replicaStateManager.reducers.forEach((reducer, index) => {
            jest.spyOn(reducer, 'aggregateShareState').mockReturnValue({
                aggregatedPart: `value${index}`,
            });
        });
        jest.spyOn(
            context.replicaStateManager,
            'sanitizeShareState',
        ).mockImplementation((state) => state);

        const aggregatedState =
            context.replicaStateManager.aggregateShareState(shareMessageBuffer);

        expect(aggregatedState).toEqual({
            aggregatedPart: 'value1',
        });

        context.replicaStateManager.reducers.forEach((reducer) => {
            expect(reducer.aggregateShareState).toHaveBeenCalledWith(
                shareMessageBuffer,
            );
        });
        expect(
            context.replicaStateManager.sanitizeShareState,
        ).toHaveBeenCalledWith(aggregatedState);
    });

    test('aggregateCloseState combines close state from all reducers based on closeMessageBuffer', () => {
        const closeMessageBuffer = [{ message: 'test' }];
        context.replicaStateManager.reducers.forEach((reducer, index) => {
            jest.spyOn(reducer, 'aggregateCloseState').mockReturnValue({
                closePart: `value${index}`,
            });
        });

        const aggregatedCloseState =
            context.replicaStateManager.aggregateCloseState(closeMessageBuffer);

        expect(aggregatedCloseState).toEqual({
            closePart: 'value1',
        });

        context.replicaStateManager.reducers.forEach((reducer) => {
            expect(reducer.aggregateCloseState).toHaveBeenCalledWith(
                closeMessageBuffer,
            );
        });
    });
});
