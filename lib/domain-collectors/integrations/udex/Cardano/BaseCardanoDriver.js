import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import BaseUDEXDriver from '../BaseUDEXDriver.js';

class BaseCardanoDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.blockFrost = new BlockFrostAPI({
            projectId: this.apiSecret,
            network: 'mainnet',
        });
    }
}

export default BaseCardanoDriver;
