import Exception from './Exception.js';

class RateLimitExceeded extends Exception {
    constructor() {
        super({
            code: 'RATE_LIMIT_EXCEEDED',
            fields: {},
        });
    }
}

export default RateLimitExceeded;
