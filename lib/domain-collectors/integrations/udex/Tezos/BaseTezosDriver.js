import { TezosToolkit } from '@taquito/taquito';
import { HttpTimeoutError } from '@taquito/http-utils';
import BaseUDEXDriver from '../BaseUDEXDriver.js';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

class BaseTezosDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.tezosClient = new TezosToolkit(this.apiSecret);
    }

    async getContractStorage(contractAddress) {
        const contract = await this.tezosClient.contract.at(contractAddress);

        return contract.storage();
    }

    async getReservesWithErrorTranslation(pair) {
        try {
            return await this.getReserves(pair);
        } catch (error) {
            if (error instanceof HttpTimeoutError) {
                throw new RateLimitExceededException();
            }

            throw error;
        }
    }
}

export default BaseTezosDriver;
