import { TezosToolkit } from '@taquito/taquito';
import { HttpTimeoutError } from '@taquito/http-utils';
import BaseUDEXDriver from '../BaseUDEXDriver.js';

class BaseTezosDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.tezosClient = new TezosToolkit(this.apiSecret);
    }

    async getContractStorage(contractAddress) {
        const contract = await this.tezosClient.contract.at(contractAddress);

        return contract.storage();
    }

    verifyRateLimitError(error) {
        return error instanceof HttpTimeoutError;
    }
}

export default BaseTezosDriver;
