import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import BigNumber from 'bignumber.js';

class BaseCardanoDriver {
    constructor({ projectId }) {
        this.blockFrost = new BlockFrostAPI({
            projectId,
            network: 'mainnet',
        });
    }

    /* istanbul ignore next */
    async getReserves() {
        throw new Error('getReserves method is not implemented');
    }

    async getExchangeRate(pair) {
        const { poolASize, poolBSize } = await this.getReserves(pair);

        const adjustedPoolASize = new BigNumber(poolASize).div(
            new BigNumber(10).pow(pair.in.decimals),
        );
        const adjustedPoolBSize = new BigNumber(poolBSize).div(
            new BigNumber(10).pow(pair.out.decimals),
        );

        const exchangeRate = adjustedPoolBSize.div(adjustedPoolASize);

        return {
            poolASize: poolASize.toString(),
            poolBSize: poolBSize.toString(),
            exchangeRate: exchangeRate.toString(),
        };
    }
}

export default BaseCardanoDriver;
