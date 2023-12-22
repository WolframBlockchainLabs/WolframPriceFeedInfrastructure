import { ethers } from 'ethers';
import BaseUDEXDriver from '../BaseUDEXDriver.js';

class BaseETHDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.provider = new ethers.JsonRpcProvider(this.apiSecret);
    }
}

export default BaseETHDriver;
