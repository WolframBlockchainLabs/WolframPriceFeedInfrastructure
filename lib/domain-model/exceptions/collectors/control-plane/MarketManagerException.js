import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import BaseControlPlaneError from './BaseControlPlaneError.js';

class MarketManagerException extends BaseControlPlaneError {
    constructor(options) {
        super({
            code: EXCEPTION_CODES.MARKET_MANAGER_FAILURE,
            ...options,
        });
    }
}

export default MarketManagerException;
