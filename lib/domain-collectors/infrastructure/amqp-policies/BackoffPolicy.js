import BaseAMQPPolicy from './BaseAMQPPolicy.js';

class BackoffPolicy extends BaseAMQPPolicy {
    constructor({ rabbitGroupName, ...options }) {
        super({ rabbitGroupName: `${rabbitGroupName}::backoff`, ...options });
    }

    async broadcastRateLimitChange(rateLimitMultiplier) {
        return this.broadcast({ rateLimitMultiplier });
    }

    async consumer(message) {
        const { rateLimitMultiplier } = this.getMessageObject(message);

        if (
            rateLimitMultiplier <=
            this.amqpManagementTarget.getStatusHandler().rateLimitMultiplier
        ) {
            return;
        }

        return this.amqpManagementTarget.reloadHandler({
            rateLimitMultiplier,
            shouldSleep: true,
        });
    }
}

export default BackoffPolicy;
