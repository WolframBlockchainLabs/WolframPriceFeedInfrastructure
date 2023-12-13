import { ethers } from 'ethers';
import BaseUDEXDriver from '../BaseUDEXDriver.js';
import RateLimitExceededException from '../../../../domain-model/exceptions/RateLimitExceededException.js';

class BaseETHDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.provider = new ethers.providers.JsonRpcProvider(this.apiSecret);
    }

    async getExchangeRate(pair) {
        try {
            return await super.getExchangeRate(pair);
        } catch {
            throw new RateLimitExceededException();
        }
    }
}

export default BaseETHDriver;
