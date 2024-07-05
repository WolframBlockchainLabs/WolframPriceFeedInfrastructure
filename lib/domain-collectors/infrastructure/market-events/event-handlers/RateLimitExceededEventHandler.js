import { MARKET_EVENTS_DICT } from '#constants/market-events.js';
import BackoffPolicy from '#domain-collectors/infrastructure/amqp-policies/stateless-policies/BackoffPolicy.js';
import BaseMarketEventHandler from './BaseMarketEventHandler.js';

class RateLimitExceededEventHandler extends BaseMarketEventHandler {
    static EVENT_NAME = MARKET_EVENTS_DICT.RATE_LIMIT_EXCEEDED;

    async execute(rateLimitMultiplier) {
        const backoffPolicy = this.getPolicy(BackoffPolicy);

        return backoffPolicy.broadcastRateLimitChange(rateLimitMultiplier);
    }
}

export default RateLimitExceededEventHandler;
