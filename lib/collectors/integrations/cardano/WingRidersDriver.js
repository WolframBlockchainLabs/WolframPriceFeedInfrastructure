import BaseCardanoDriver from './BaseCardanoDriver.js';
import BigNumber from 'bignumber.js';

class WingRidersDriver extends BaseCardanoDriver {
    async getExchangeRate(pair) {
        const { poolASize, poolBSize } = await this.getReserves(pair);

        const exchangeRate = poolBSize.div(poolASize);

        return {
            poolASize: poolASize.toString(),
            poolBSize: poolBSize.toString(),
            exchangeRate: exchangeRate.toString(),
        };
    }

    async getReserves(pair) {
        const assets = await this.blockFrost.addresses(pair.pool);

        const reserves = {
            [pair.in.address]: new BigNumber(
                assets.amount.find(
                    (item) => item.unit === pair.in.address,
                ).quantity,
            ),
            [pair.out.address]: new BigNumber(
                assets.amount.find(
                    (item) => item.unit === pair.out.address,
                ).quantity,
            ),
        };

        return {
            poolASize: reserves[pair.in.address].div(
                new BigNumber(10).pow(pair.in.decimals),
            ),
            poolBSize: reserves[pair.out.address].div(
                new BigNumber(10).pow(pair.out.decimals),
            ),
        };
    }
}

export default WingRidersDriver;
