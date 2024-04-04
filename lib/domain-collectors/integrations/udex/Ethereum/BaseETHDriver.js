import { ethers } from 'ethers';
import BaseUDEXDriver from '../BaseUDEXDriver.js';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

const RATE_LIMIT_ERRORS = ['exceeded maximum retry limit'];

class BaseETHDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.provider = new ethers.JsonRpcProvider(this.apiSecret);
    }

    async getReservesWithErrorTranslation(pair) {
        try {
            return await this.getReserves(pair);
        } catch (error) {
            if (this.verifyRateLimitError(error)) {
                throw new RateLimitExceededException();
            }

            throw error;
        }
    }

    verifyRateLimitError(error) {
        return (
            error.code === 'SERVER_ERROR' &&
            RATE_LIMIT_ERRORS.includes(error.shortMessage)
        );
    }
}

export default BaseETHDriver;
