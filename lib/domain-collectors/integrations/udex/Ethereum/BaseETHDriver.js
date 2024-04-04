import { ethers } from 'ethers';
import BaseUDEXDriver from '../BaseUDEXDriver.js';

class BaseETHDriver extends BaseUDEXDriver {
    static RATE_LIMIT_ERRORS = ['exceeded maximum retry limit'];

    constructor(config) {
        super(config);

        this.provider = new ethers.JsonRpcProvider(this.apiSecret);
    }

    verifyRateLimitError(error) {
        return (
            error.code === 'SERVER_ERROR' &&
            BaseETHDriver.RATE_LIMIT_ERRORS.includes(error.shortMessage)
        );
    }
}

export default BaseETHDriver;
