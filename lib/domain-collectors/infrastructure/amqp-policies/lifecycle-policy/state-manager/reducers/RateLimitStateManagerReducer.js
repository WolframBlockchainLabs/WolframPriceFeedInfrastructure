import BaseReplicaStateManagerReducer from './BaseReplicaStateManagerReducer.js';

class RateLimitStateManagerReducer extends BaseReplicaStateManagerReducer {
    getCurrentState() {
        return {
            rateLimitMultiplier: this.marketsManager
                .getInternalScheduler()
                .getRateLimitMultiplier(),
        };
    }

    aggregateState(statusMessageBuffer) {
        const rateLimitMultiplier = Math.max(
            ...statusMessageBuffer.map(
                (message) => message.data.rateLimitMultiplier,
            ),
        );

        return { rateLimitMultiplier };
    }

    normalizeState({ rateLimitMultiplier }) {
        return {
            ...(rateLimitMultiplier && { rateLimitMultiplier }),
        };
    }

    aggregateShareState(shareMessageBuffer) {
        const rateLimitMultiplier = Math.max(
            ...shareMessageBuffer.map(
                (message) => message.data.rateLimitMultiplier,
            ),
        );

        return { rateLimitMultiplier };
    }

    sanitizeShareState({ rateLimitMultiplier }) {
        const isValidRateLimit =
            rateLimitMultiplier >
            this.marketsManager.getInternalScheduler().getRateLimitMultiplier();

        return {
            ...(isValidRateLimit && {
                rateLimitMultiplier: rateLimitMultiplier,
            }),
        };
    }

    shouldReload({ rateLimitMultiplier }) {
        if (!rateLimitMultiplier) return false;

        return (
            rateLimitMultiplier >
            this.marketsManager.getInternalScheduler().getRateLimitMultiplier()
        );
    }
}

export default RateLimitStateManagerReducer;
