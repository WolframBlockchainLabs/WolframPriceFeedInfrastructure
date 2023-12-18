import { TezosToolkit } from '@taquito/taquito';
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
}

export default BaseTezosDriver;
