import Exception from './Exception.js';

class RateLimitExceededException extends Exception {
    constructor() {
        super({
            code: 'RATE_LIMIT_EXCEEDED',
            fields: {},
        });
    }
}

export default RateLimitExceededException;
