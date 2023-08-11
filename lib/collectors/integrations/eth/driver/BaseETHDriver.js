import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

class BaseETHDriver {
    constructor(rpcUrl) {
        this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    }

    getExchangeRate() {
        throw new Error('getExchangeRate method is not implemented');
    }

    fromReadableAmount(amount, decimals) {
        return new BigNumber(amount)
            .times(new BigNumber(10).pow(decimals))
            .toString();
    }

    toReadableAmount(rawAmount, decimals) {
        return new BigNumber(rawAmount)
            .div(new BigNumber(10).pow(decimals))
            .toString();
    }
}

export default BaseETHDriver;
