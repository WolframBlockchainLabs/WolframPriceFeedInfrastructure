import RateLimitStateManagerReducer from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/reducers/RateLimitStateManagerReducer.js';

describe('[domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager/reducers]: RateLimitStateManagerReducer Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.mockInternalScheduler = {
            getRateLimitMultiplier: jest.fn(),
        };
        context.mockMarketsManager = {
            getInternalScheduler: jest
                .fn()
                .mockReturnValue(context.mockInternalScheduler),
        };
        context.replicaDiscoveryPolicy = {
            getPrivateQueueAddress() {
                return 'test-address';
            },
        };

        context.rateLimitPlugin = new RateLimitStateManagerReducer({
            marketsManager: context.mockMarketsManager,
            replicaDiscoveryPolicy: context.replicaDiscoveryPolicy,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getCurrentState returns current rate limit multiplier', () => {
        const expectedMultiplier = 2;
        context.mockInternalScheduler.getRateLimitMultiplier.mockReturnValue(
            expectedMultiplier,
        );

        const state = context.rateLimitPlugin.getCurrentState();

        expect(state).toEqual({ rateLimitMultiplier: expectedMultiplier });
        expect(
            context.mockInternalScheduler.getRateLimitMultiplier,
        ).toHaveBeenCalled();
    });

    test('sanitizeShareState returns sanitized rate limit multiplier', () => {
        const inputMultiplier = 3;
        const currentMultiplier = 2;
        context.mockInternalScheduler.getRateLimitMultiplier.mockReturnValue(
            currentMultiplier,
        );

        const sanitizedMessage = context.rateLimitPlugin.sanitizeShareState({
            rateLimitMultiplier: inputMultiplier,
        });

        expect(sanitizedMessage).toEqual({
            rateLimitMultiplier: inputMultiplier,
        });
    });

    test('sanitizeShareState returns empty object if rate limit is not valid', () => {
        const inputMultiplier = 1;
        const currentMultiplier = 2;
        context.mockInternalScheduler.getRateLimitMultiplier.mockReturnValue(
            currentMultiplier,
        );

        const sanitizedMessage = context.rateLimitPlugin.sanitizeShareState({
            data: { rateLimitMultiplier: inputMultiplier },
        });

        expect(sanitizedMessage).toEqual({});
    });

    test('shouldReload returns true if new rate limit is higher', () => {
        const state = { rateLimitMultiplier: 3 };
        const currentMultiplier = 2;
        context.mockInternalScheduler.getRateLimitMultiplier.mockReturnValue(
            currentMultiplier,
        );

        const shouldReload = context.rateLimitPlugin.shouldReload(state);

        expect(shouldReload).toBe(true);
    });

    test('shouldReload returns false if new rate limit is not higher', () => {
        const state = { rateLimitMultiplier: 1 };
        const currentMultiplier = 2;
        context.mockInternalScheduler.getRateLimitMultiplier.mockReturnValue(
            currentMultiplier,
        );

        const shouldReload = context.rateLimitPlugin.shouldReload(state);

        expect(shouldReload).toBe(false);
    });

    test('shouldReload returns false if rateLimitMultiplier is not provided', () => {
        const stateWithoutMultiplier = {};
        const shouldReload = context.rateLimitPlugin.shouldReload(
            stateWithoutMultiplier,
        );

        expect(shouldReload).toBe(false);
    });

    test('shouldReload returns true if provided rateLimitMultiplier is higher than current', () => {
        const state = { rateLimitMultiplier: 3 };
        const currentMultiplier = 2;
        context.mockInternalScheduler.getRateLimitMultiplier.mockReturnValue(
            currentMultiplier,
        );

        const shouldReload = context.rateLimitPlugin.shouldReload(state);

        expect(shouldReload).toBe(true);
    });

    test('shouldReload returns false if provided rateLimitMultiplier is not higher than current', () => {
        const state = { rateLimitMultiplier: 1 };
        const currentMultiplier = 2;
        context.mockInternalScheduler.getRateLimitMultiplier.mockReturnValue(
            currentMultiplier,
        );

        const shouldReload = context.rateLimitPlugin.shouldReload(state);

        expect(shouldReload).toBe(false);
    });

    test('normalizeState returns the passed state', () => {
        const state = { rateLimitMultiplier: 2 };

        const normalizedState = context.rateLimitPlugin.normalizeState(state);

        expect(normalizedState).toEqual(state);
    });

    test('aggregateState returns the highest rate limit multiplier from the status message buffer', () => {
        const statusMessageBuffer = [
            { data: { rateLimitMultiplier: 2 } },
            { data: { rateLimitMultiplier: 3 } },
            { data: { rateLimitMultiplier: 1 } },
        ];

        const aggregatedState =
            context.rateLimitPlugin.aggregateState(statusMessageBuffer);

        expect(aggregatedState).toEqual({ rateLimitMultiplier: 3 });
    });

    test('aggregateShareState returns the highest rate limit multiplier from the status message buffer', () => {
        const statusMessageBuffer = [
            { data: { rateLimitMultiplier: 2 } },
            { data: { rateLimitMultiplier: 3 } },
            { data: { rateLimitMultiplier: 1 } },
        ];

        const aggregatedState =
            context.rateLimitPlugin.aggregateShareState(statusMessageBuffer);

        expect(aggregatedState).toEqual({ rateLimitMultiplier: 3 });
    });
});
