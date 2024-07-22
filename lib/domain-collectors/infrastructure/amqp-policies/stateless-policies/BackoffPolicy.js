import { MARKET_EVENTS_DICT } from '#constants/collectors/market-events.js';
import BroadcastAMQPPolicy from '../BroadcastAMQPPolicy.js';

class BackoffPolicy extends BroadcastAMQPPolicy {
    static PREFETCH_COUNT = 1;

    async broadcastRateLimitChange(rateLimitMultiplier) {
        return this.broadcast({ rateLimitMultiplier });
    }

    async process({ rateLimitMultiplier }) {
        if (!this.shouldReload(rateLimitMultiplier)) return;

        await this.marketsManager.reloadActive({
            rateLimitMultiplier,
            shouldSleep: true,
        });

        await this.marketEventManager.emitAsync(
            MARKET_EVENTS_DICT.RELOAD_CLUSTER,
        );
    }

    shouldReload(rateLimitMultiplier) {
        const currentMultiplier = this.marketsManager
            .getInternalScheduler()
            .getRateLimitMultiplier();

        return rateLimitMultiplier && rateLimitMultiplier > currentMultiplier;
    }
}

export default BackoffPolicy;
