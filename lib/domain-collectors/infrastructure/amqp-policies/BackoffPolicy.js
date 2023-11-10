import BaseAMQPPolicy from './BaseAMQPPolicy.js';

class BackoffPolicy extends BaseAMQPPolicy {
    constructor({ amqpClient, rabbitGroupName }) {
        super({ amqpClient, rabbitGroupName: `${rabbitGroupName}::backoff` });
    }

    async broadcastRateLimitChange(rateLimitMultiplier) {
        return this.broadcast({ rateLimitMultiplier });
    }
}

export default BackoffPolicy;
