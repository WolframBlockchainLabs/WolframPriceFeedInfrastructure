import { MARKET_EVENTS_DICT } from '#constants/collectors/market-events.js';
import BackoffPolicy from '#domain-collectors/infrastructure/amqp-policies/stateless-policies/BackoffPolicy.js';
import RateLimitExceededEventHandler from '#domain-collectors/infrastructure/market-events/event-handlers/RateLimitExceededEventHandler.js';

describe('[domain-collectors/infrastructure/amqp-policies/state-manager/handlers]: RateLimitExceededEventHandler Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.mockMarketsAMQPManger = {
            getPolicy: jest.fn(),
        };
        context.mockBackoffPolicy = {
            broadcastRateLimitChange: jest.fn(),
        };

        context.mockMarketsAMQPManger.getPolicy.mockReturnValue(
            context.mockBackoffPolicy,
        );

        context.rateLimitExceededEventHandler =
            new RateLimitExceededEventHandler({
                marketsAMQPManger: context.mockMarketsAMQPManger,
            });
    });

    test('EVENT_NAME should be MARKET_EVENTS_DICT.RATE_LIMIT_EXCEEDED', () => {
        expect(RateLimitExceededEventHandler.EVENT_NAME).toBe(
            MARKET_EVENTS_DICT.RATE_LIMIT_EXCEEDED,
        );
    });

    test('execute should call broadcastRateLimitChange on BackoffPolicy with rateLimitMultiplier', () => {
        const rateLimitMultiplier = 2;

        context.rateLimitExceededEventHandler.execute(rateLimitMultiplier);

        expect(context.mockMarketsAMQPManger.getPolicy).toHaveBeenCalledWith(
            BackoffPolicy,
        );
        expect(
            context.mockBackoffPolicy.broadcastRateLimitChange,
        ).toHaveBeenCalledWith(rateLimitMultiplier);
    });
});
