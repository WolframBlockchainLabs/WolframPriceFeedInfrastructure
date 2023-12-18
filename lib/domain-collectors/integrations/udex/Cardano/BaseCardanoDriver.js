import {
    BlockFrostAPI,
    BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
import BaseUDEXDriver from '../BaseUDEXDriver.js';
import RateLimitExceededException from '../../../../domain-model/exceptions/RateLimitExceededException.js';

class BaseCardanoDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.blockFrost = new BlockFrostAPI({
            projectId: this.apiSecret,
            network: 'mainnet',
        });
    }

    async getReservesWithErrorTranslation(pair) {
        try {
            return await this.getReserves(pair);
        } catch (error) {
            if (
                error instanceof BlockfrostServerError &&
                error.status_code === 429
            ) {
                throw new RateLimitExceededException();
            }

            throw error;
        }
    }
}

export default BaseCardanoDriver;
