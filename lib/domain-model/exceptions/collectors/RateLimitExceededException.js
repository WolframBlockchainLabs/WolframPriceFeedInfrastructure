import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import BaseException from '../BaseException.js';

class RateLimitExceededException extends BaseException {
    constructor() {
        super({
            code: EXCEPTION_CODES.RATE_LIMIT_EXCEEDED,
        });
    }
}

export default RateLimitExceededException;
