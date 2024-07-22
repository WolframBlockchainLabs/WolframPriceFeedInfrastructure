import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import BaseControlPlaneError from './BaseControlPlaneError.js';

class CollectorsSchedulerException extends BaseControlPlaneError {
    constructor(options) {
        super({
            code: EXCEPTION_CODES.COLLECTORS_SCHEDULER_FAILURE,
            ...options,
        });
    }
}

export default CollectorsSchedulerException;
