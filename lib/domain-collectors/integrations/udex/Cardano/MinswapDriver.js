// eslint-disable-next-line import/no-unresolved
import { BlockfrostAdapter } from '@minswap/sdk';
import BaseCardanoDriver from './BaseCardanoDriver.js';

class MinswapDriver extends BaseCardanoDriver {
    constructor(options) {
        super(options);

        this.minswapAdapter = new BlockfrostAdapter({
            blockFrost: this.blockFrost,
        });
    }

    async getReserves(pair) {
        const pool = await this.minswapAdapter.getPoolById({
            id: pair.meta.pool,
        });

        const reserves = [pool.reserveA.toString(), pool.reserveB.toString()];

        const [poolASize, poolBSize] =
            pair.in.meta.address === pool.assetA
                ? reserves
                : reserves.reverse();

        return {
            poolASize,
            poolBSize,
        };
    }
}

export default MinswapDriver;
