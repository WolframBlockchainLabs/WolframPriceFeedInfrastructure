import { TezosToolkit } from '@taquito/taquito';

class BaseTezosDriver {
    constructor(rpcUrl) {
        this.tezosClient = new TezosToolkit(rpcUrl);
    }

    async getContractStorage(contractAddress) {
        const contract = await this.tezosClient.contract.at(contractAddress);

        return contract.storage();
    }
}

export default BaseTezosDriver;
