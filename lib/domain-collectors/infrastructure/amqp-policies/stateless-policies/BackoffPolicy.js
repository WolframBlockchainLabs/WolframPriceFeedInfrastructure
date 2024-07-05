import BaseAMQPPolicy from '../BaseAMQPPolicy.js';

class BackoffPolicy extends BaseAMQPPolicy {
    static PREFETCH_COUNT = 1;

    async broadcastRateLimitChange(rateLimitMultiplier) {
        return this.broadcast({ rateLimitMultiplier });
    }

    async process({ rateLimitMultiplier }) {
        if (!this.shouldReload(rateLimitMultiplier)) return;

        return this.marketsManager.reloadActive({
            rateLimitMultiplier,
            shouldSleep: true,
        });
    }

    shouldReload(rateLimitMultiplier) {
        const currentMultiplier = this.marketsManager
            .getInternalScheduler()
            .getRateLimitMultiplier();

        return rateLimitMultiplier && rateLimitMultiplier > currentMultiplier;
    }
}

export default BackoffPolicy;
