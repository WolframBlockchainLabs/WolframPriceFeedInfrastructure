import BaseTezosDriver from './BaseTezosDriver.js';
import BigNumber from 'bignumber.js';

class PlentyDriver extends BaseTezosDriver {
    async getExchangeRate(pair) {
        const storage = await this.getContractStorage(pair.meta.pool);
        const storagePools = this.getTokenPools(storage, pair);

        return this.getPairPrice(pair, storagePools);
    }

    getTokenPools(storage, pair) {
        const storagePools = [storage.token1_pool, storage.token2_pool];
        const token1Address = storage.token1Address;
        const [token1_pool, token2_pool] =
            pair.in.meta.address === token1Address
                ? storagePools
                : storagePools.reverse();

        return { token1_pool, token2_pool };
    }

    getPairPrice(pair, { token1_pool, token2_pool }) {
        const poolASize = new BigNumber(token1_pool).div(
            new BigNumber(10).pow(pair.in.meta.decimals),
        );
        const poolBSize = new BigNumber(token2_pool).div(
            new BigNumber(10).pow(pair.out.meta.decimals),
        );

        const exchangeRate = poolBSize.dividedBy(poolASize).toString();

        return {
            exchangeRate,
            poolASize: poolASize.toString(),
            poolBSize: poolBSize.toString(),
        };
    }
}

export default PlentyDriver;
