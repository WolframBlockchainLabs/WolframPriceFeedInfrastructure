import { TezosToolkit } from '@taquito/taquito';

class BaseTezosDriver {
    constructor(rpcUrl) {
        this.tezosClient = new TezosToolkit(rpcUrl);
    }

    /* c8 ignore next 3 */
    getExchangeRate() {
        throw new Error('getExchangeRate method is not implemented');
    }

    async getContractStorage(contractAddress) {
        const contract = await this.tezosClient.contract.at(contractAddress);

        return contract.storage();
    }
}

export default BaseTezosDriver;
