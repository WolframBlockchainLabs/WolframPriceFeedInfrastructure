import { TezosToolkit } from '@taquito/taquito';
import BaseUDEXDriver from '../BaseUDEXDriver.js';
import RateLimitExceededException from '../../../../domain-model/exceptions/RateLimitExceededException.js';

class BaseTezosDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.tezosClient = new TezosToolkit(this.apiSecret);
    }

    async getExchangeRate(pair) {
        try {
            return await super.getExchangeRate(pair);
        } catch {
            throw new RateLimitExceededException();
        }
    }

    async getContractStorage(contractAddress) {
        const contract = await this.tezosClient.contract.at(contractAddress);

        return contract.storage();
    }
}

export default BaseTezosDriver;
