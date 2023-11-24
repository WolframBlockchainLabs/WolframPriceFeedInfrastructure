import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import BaseUDEXDriver from '../BaseUDEXDriver.js';

class BaseETHDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.provider = new ethers.providers.JsonRpcProvider(this.apiSecret);
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
