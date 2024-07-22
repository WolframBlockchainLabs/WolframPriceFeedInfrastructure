import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import BaseControlPlaneError from './BaseControlPlaneError.js';

class CollectorsManagerException extends BaseControlPlaneError {
    constructor(options) {
        super({
            code: EXCEPTION_CODES.COLLECTORS_MANAGER_FAILURE,
            ...options,
        });
    }
}

export default CollectorsManagerException;
