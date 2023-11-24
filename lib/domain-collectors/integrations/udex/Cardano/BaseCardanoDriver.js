import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import BigNumber from 'bignumber.js';
import BaseUDEXDriver from '../BaseUDEXDriver.js';

class BaseCardanoDriver extends BaseUDEXDriver {
    constructor(config) {
        super(config);

        this.blockFrost = new BlockFrostAPI({
            projectId: this.apiSecret,
            network: 'mainnet',
        });
    }

    async getExchangeRate(pair) {
        const { poolASize, poolBSize } = await this.getReserves(pair);

        const adjustedPoolASize = new BigNumber(poolASize).div(
            new BigNumber(10).pow(pair.in.meta.decimals),
        );
        const adjustedPoolBSize = new BigNumber(poolBSize).div(
            new BigNumber(10).pow(pair.out.meta.decimals),
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
