// eslint-disable-next-line import/no-unresolved
import { BlockfrostAdapter } from '@minswap/sdk';
import BaseCardanoDriver from './BaseCardanoDriver.js';
import BigNumber from 'bignumber.js';

class MinswapDriver extends BaseCardanoDriver {
    constructor(options) {
        super(options);

        this.minswapAdapter = new BlockfrostAdapter({
            blockFrost: this.blockFrost,
        });
    }

    async getExchangeRate(pair) {
        const pool = await this.minswapAdapter.getPoolById({
            id: pair.pool,
        });

        const { poolASize, poolBSize } = this.getReserves(pool, pair);

        const exchangeRate = poolBSize.div(poolASize);

        return {
            poolASize: poolASize.toString(),
            poolBSize: poolBSize.toString(),
            exchangeRate: exchangeRate.toString(),
        };
    }

    getReserves(pool, pair) {
        const reserves = [
            new BigNumber(pool.reserveA.toString()),
            new BigNumber(pool.reserveB.toString()),
        ];

        const [poolASize, poolBSize] =
            pair.in.address === pool.assetA ? reserves : reserves.reverse();

        return {
            poolASize: poolASize.div(new BigNumber(10).pow(pair.in.decimals)),
            poolBSize: poolBSize.div(new BigNumber(10).pow(pair.out.decimals)),
        };
    }
}

export default MinswapDriver;
