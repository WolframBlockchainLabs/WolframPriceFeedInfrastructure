import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

class BaseCardanoDriver {
    constructor({ projectId }) {
        this.blockFrost = new BlockFrostAPI({
            projectId,
            network: 'mainnet',
        });
    }

    /* c8 ignore next 3 */
    getExchangeRate() {
        throw new Error('getExchangeRate method is not implemented');
    }
}

export default BaseCardanoDriver;
