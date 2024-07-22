import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import BaseException from '../BaseException.js';

class MutexTimeoutException extends BaseException {
    constructor() {
        super({
            code: EXCEPTION_CODES.MUTEX_TIMEOUT_EXCEEDED,
        });
    }

    toHash() {
        return {
            ...super.toHash(),
            stack: this.stack,
        };
    }
}

export default MutexTimeoutException;
