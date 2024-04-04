import {
    BlockFrostAPI,
    BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
import BaseUDEXDriver from '../BaseUDEXDriver.js';

class BaseCardanoDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.blockFrost = new BlockFrostAPI({
            projectId: this.apiSecret,
            network: 'mainnet',
        });
    }

    verifyRateLimitError(error) {
        return (
            error instanceof BlockfrostServerError &&
            (error.status_code === 402 || error.status_code === 429)
        );
    }
}

export default BaseCardanoDriver;
